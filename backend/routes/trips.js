// Trip routes - CRUD operations for travel experiences
const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Trip = require("../models/Trip")
const { authenticateToken, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/trips
// @desc    Get all trips with filtering and pagination
// @access  Public
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    query("country").optional().isString().withMessage("Country must be a string"),
    query("minCost").optional().isFloat({ min: 0 }).withMessage("Min cost must be a positive number"),
    query("maxCost").optional().isFloat({ min: 0 }).withMessage("Max cost must be a positive number"),
    query("sortBy").optional().isIn(["createdAt", "totalCost", "likes"]).withMessage("Invalid sort field"),
  ],
  optionalAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      // Pagination
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const skip = (page - 1) * limit

      // Build filter object
      const filter = { isPublished: true }

      if (req.query.country) {
        filter["location.country"] = new RegExp(req.query.country, "i")
      }

      if (req.query.city) {
        filter["location.city"] = new RegExp(req.query.city, "i")
      }

      // Cost filtering (calculate total cost)
      if (req.query.minCost || req.query.maxCost) {
        const costFilter = {}
        if (req.query.minCost) costFilter.$gte = Number.parseFloat(req.query.minCost)
        if (req.query.maxCost) costFilter.$lte = Number.parseFloat(req.query.maxCost)

        // This is a simplified approach - in production, you might want to use aggregation
        filter.$expr = {
          $and: [
            req.query.minCost
              ? {
                  $gte: [
                    {
                      $add: [
                        "$costs.transport",
                        "$costs.accommodation",
                        "$costs.food",
                        "$costs.activities",
                        "$costs.other",
                      ],
                    },
                    Number.parseFloat(req.query.minCost),
                  ],
                }
              : {},
            req.query.maxCost
              ? {
                  $lte: [
                    {
                      $add: [
                        "$costs.transport",
                        "$costs.accommodation",
                        "$costs.food",
                        "$costs.activities",
                        "$costs.other",
                      ],
                    },
                    Number.parseFloat(req.query.maxCost),
                  ],
                }
              : {},
          ].filter((obj) => Object.keys(obj).length > 0),
        }
      }

      // Sorting
      let sortOption = { createdAt: -1 } // Default: newest first
      if (req.query.sortBy === "likes") {
        sortOption = { likes: -1 }
      } else if (req.query.sortBy === "totalCost") {
        sortOption = { "costs.transport": -1 } // Simplified sorting
      }

      // Execute query
      const trips = await Trip.find(filter)
        .populate("author", "username firstName lastName profilePicture")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean()

      // Get total count for pagination
      const total = await Trip.countDocuments(filter)

      // Add user-specific data if authenticated
      if (req.user) {
        // You can add wishlist status, user's like status, etc.
        trips.forEach((trip) => {
          trip.isLikedByUser = trip.likes.some((like) => like.user.toString() === req.user._id.toString())
        })
      }

      res.json({
        trips,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTrips: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      })
    } catch (error) {
      console.error("Get trips error:", error)
      res.status(500).json({ message: "Server error fetching trips" })
    }
  },
)

// @route   GET /api/trips/:id
// @desc    Get single trip by ID
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("author", "username firstName lastName profilePicture bio")
      .lean()

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" })
    }

    // Add user-specific data if authenticated
    if (req.user) {
      trip.isLikedByUser = trip.likes.some((like) => like.user.toString() === req.user._id.toString())
      trip.isOwner = trip.author._id.toString() === req.user._id.toString()
    }

    res.json(trip)
  } catch (error) {
    console.error("Get trip error:", error)
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid trip ID" })
    }
    res.status(500).json({ message: "Server error fetching trip" })
  }
})

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Private
router.post(
  "/",
  [
    authenticateToken,
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 100 })
      .withMessage("Title cannot exceed 100 characters"),
    body("description")
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 2000 })
      .withMessage("Description cannot exceed 2000 characters"),
    body("location.country").notEmpty().withMessage("Country is required"),
    body("location.city").notEmpty().withMessage("City is required"),
    body("duration.days").isInt({ min: 1 }).withMessage("Duration must be at least 1 day"),
    body("costs.transport").optional().isFloat({ min: 0 }).withMessage("Transport cost must be a positive number"),
    body("costs.accommodation")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Accommodation cost must be a positive number"),
    body("costs.food").optional().isFloat({ min: 0 }).withMessage("Food cost must be a positive number"),
    body("costs.activities").optional().isFloat({ min: 0 }).withMessage("Activities cost must be a positive number"),
    body("costs.other").optional().isFloat({ min: 0 }).withMessage("Other cost must be a positive number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const tripData = {
        ...req.body,
        author: req.user._id,
      }

      const trip = new Trip(tripData)
      await trip.save()

      // Populate author data for response
      await trip.populate("author", "username firstName lastName profilePicture")

      res.status(201).json({
        message: "Trip created successfully",
        trip,
      })
    } catch (error) {
      console.error("Create trip error:", error)
      res.status(500).json({ message: "Server error creating trip" })
    }
  },
)

// @route   PUT /api/trips/:id
// @desc    Update a trip
// @access  Private (only trip owner)
router.put(
  "/:id",
  [
    authenticateToken,
    body("title").optional().isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
    body("description").optional().isLength({ max: 2000 }).withMessage("Description cannot exceed 2000 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const trip = await Trip.findById(req.params.id)

      if (!trip) {
        return res.status(404).json({ message: "Trip not found" })
      }

      // Check if user owns the trip
      if (trip.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to update this trip" })
      }

      // Update trip
      Object.assign(trip, req.body)
      await trip.save()

      await trip.populate("author", "username firstName lastName profilePicture")

      res.json({
        message: "Trip updated successfully",
        trip,
      })
    } catch (error) {
      console.error("Update trip error:", error)
      res.status(500).json({ message: "Server error updating trip" })
    }
  },
)

// @route   DELETE /api/trips/:id
// @desc    Delete a trip
// @access  Private (only trip owner)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" })
    }

    // Check if user owns the trip
    if (trip.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this trip" })
    }

    await Trip.findByIdAndDelete(req.params.id)

    res.json({ message: "Trip deleted successfully" })
  } catch (error) {
    console.error("Delete trip error:", error)
    res.status(500).json({ message: "Server error deleting trip" })
  }
})

// @route   POST /api/trips/:id/like
// @desc    Like/unlike a trip
// @access  Private
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" })
    }

    // Check if user already liked the trip
    const existingLikeIndex = trip.likes.findIndex((like) => like.user.toString() === req.user._id.toString())

    if (existingLikeIndex > -1) {
      // Unlike the trip
      trip.likes.splice(existingLikeIndex, 1)
    } else {
      // Like the trip
      trip.likes.push({ user: req.user._id })
    }

    await trip.save()

    res.json({
      message: existingLikeIndex > -1 ? "Trip unliked" : "Trip liked",
      likeCount: trip.likes.length,
      isLiked: existingLikeIndex === -1,
    })
  } catch (error) {
    console.error("Like trip error:", error)
    res.status(500).json({ message: "Server error liking trip" })
  }
})

// @route   GET /api/trips/user/:userId
// @desc    Get trips by specific user
// @access  Public
router.get("/user/:userId", async (req, res) => {
  try {
    const trips = await Trip.find({
      author: req.params.userId,
      isPublished: true,
    })
      .populate("author", "username firstName lastName profilePicture")
      .sort({ createdAt: -1 })

    res.json(trips)
  } catch (error) {
    console.error("Get user trips error:", error)
    res.status(500).json({ message: "Server error fetching user trips" })
  }
})

module.exports = router
