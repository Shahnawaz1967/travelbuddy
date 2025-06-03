// Wishlist routes - save and manage favorite trips
const express = require("express")
const Trip = require("../models/Trip")
const User = require("../models/User")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// For simplicity, we'll store wishlist in a separate collection
// In a real app, you might add a wishlist field to the User model
const mongoose = require("mongoose")

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Ensure a user can't save the same trip twice
wishlistSchema.index({ user: 1, trip: 1 }, { unique: true })

const Wishlist = mongoose.model("Wishlist", wishlistSchema)

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ user: req.user._id })
      .populate({
        path: "trip",
        populate: {
          path: "author",
          select: "username firstName lastName profilePicture",
        },
      })
      .sort({ createdAt: -1 })

    // Filter out any items where the trip was deleted
    const validWishlistItems = wishlistItems.filter((item) => item.trip)

    res.json(validWishlistItems.map((item) => item.trip))
  } catch (error) {
    console.error("Get wishlist error:", error)
    res.status(500).json({ message: "Server error fetching wishlist" })
  }
})

// @route   POST /api/wishlist/:tripId
// @desc    Add trip to wishlist
// @access  Private
router.post("/:tripId", authenticateToken, async (req, res) => {
  try {
    // Verify trip exists
    const trip = await Trip.findById(req.params.tripId)
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" })
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: req.user._id,
      trip: req.params.tripId,
    })

    if (existingItem) {
      return res.status(400).json({ message: "Trip already in wishlist" })
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      user: req.user._id,
      trip: req.params.tripId,
    })

    await wishlistItem.save()

    res.status(201).json({
      message: "Trip added to wishlist",
      tripId: req.params.tripId,
    })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Trip already in wishlist" })
    }
    res.status(500).json({ message: "Server error adding to wishlist" })
  }
})

// @route   DELETE /api/wishlist/:tripId
// @desc    Remove trip from wishlist
// @access  Private
router.delete("/:tripId", authenticateToken, async (req, res) => {
  try {
    const result = await Wishlist.findOneAndDelete({
      user: req.user._id,
      trip: req.params.tripId,
    })

    if (!result) {
      return res.status(404).json({ message: "Trip not found in wishlist" })
    }

    res.json({
      message: "Trip removed from wishlist",
      tripId: req.params.tripId,
    })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    res.status(500).json({ message: "Server error removing from wishlist" })
  }
})

// @route   GET /api/wishlist/check/:tripId
// @desc    Check if trip is in user's wishlist
// @access  Private
router.get("/check/:tripId", authenticateToken, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      user: req.user._id,
      trip: req.params.tripId,
    })

    res.json({
      isInWishlist: !!wishlistItem,
    })
  } catch (error) {
    console.error("Check wishlist error:", error)
    res.status(500).json({ message: "Server error checking wishlist" })
  }
})

module.exports = router
