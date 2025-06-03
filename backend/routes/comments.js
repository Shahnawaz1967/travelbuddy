// Comment routes - for trip comments and Q&A
const express = require("express")
const { body, validationResult } = require("express-validator")
const Comment = require("../models/Comment")
const Trip = require("../models/Trip")
const { authenticateToken, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/comments/trip/:tripId
// @desc    Get all comments for a trip
// @access  Public
router.get("/trip/:tripId", optionalAuth, async (req, res) => {
  try {
    // Verify trip exists
    const trip = await Trip.findById(req.params.tripId)
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" })
    }

    // Get comments for the trip
    const comments = await Comment.find({
      trip: req.params.tripId,
      parentComment: null, // Only get top-level comments
    })
      .populate("author", "username firstName lastName profilePicture")
      .sort({ createdAt: -1 })

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("author", "username firstName lastName profilePicture")
          .sort({ createdAt: 1 })

        const commentObj = comment.toObject()
        commentObj.replies = replies

        // Add user-specific data if authenticated
        if (req.user) {
          commentObj.isLikedByUser = comment.likes.some((like) => like.user.toString() === req.user._id.toString())
          commentObj.isOwner = comment.author._id.toString() === req.user._id.toString()

          // Check replies too
          commentObj.replies = replies.map((reply) => {
            const replyObj = reply.toObject()
            replyObj.isLikedByUser = reply.likes.some((like) => like.user.toString() === req.user._id.toString())
            replyObj.isOwner = reply.author._id.toString() === req.user._id.toString()
            return replyObj
          })
        }

        return commentObj
      }),
    )

    res.json(commentsWithReplies)
  } catch (error) {
    console.error("Get comments error:", error)
    res.status(500).json({ message: "Server error fetching comments" })
  }
})

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post(
  "/",
  [
    authenticateToken,
    body("content")
      .notEmpty()
      .withMessage("Comment content is required")
      .isLength({ max: 1000 })
      .withMessage("Comment cannot exceed 1000 characters"),
    body("trip").notEmpty().withMessage("Trip ID is required").isMongoId().withMessage("Invalid trip ID"),
    body("parentComment").optional().isMongoId().withMessage("Invalid parent comment ID"),
    body("type").optional().isIn(["question", "answer", "general"]).withMessage("Invalid comment type"),
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

      const { content, trip, parentComment, type } = req.body

      // Verify trip exists
      const tripExists = await Trip.findById(trip)
      if (!tripExists) {
        return res.status(404).json({ message: "Trip not found" })
      }

      // If it's a reply, verify parent comment exists
      if (parentComment) {
        const parentExists = await Comment.findById(parentComment)
        if (!parentExists) {
          return res.status(404).json({ message: "Parent comment not found" })
        }
      }

      // Create comment
      const comment = new Comment({
        content,
        trip,
        author: req.user._id,
        parentComment: parentComment || null,
        type: type || "general",
      })

      await comment.save()

      // Populate author data for response
      await comment.populate("author", "username firstName lastName profilePicture")

      res.status(201).json({
        message: "Comment created successfully",
        comment,
      })
    } catch (error) {
      console.error("Create comment error:", error)
      res.status(500).json({ message: "Server error creating comment" })
    }
  },
)

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private (only comment owner)
router.put(
  "/:id",
  [
    authenticateToken,
    body("content")
      .notEmpty()
      .withMessage("Comment content is required")
      .isLength({ max: 1000 })
      .withMessage("Comment cannot exceed 1000 characters"),
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

      const comment = await Comment.findById(req.params.id)

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" })
      }

      // Check if user owns the comment
      if (comment.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to update this comment" })
      }

      // Update comment
      comment.content = req.body.content
      await comment.save()

      await comment.populate("author", "username firstName lastName profilePicture")

      res.json({
        message: "Comment updated successfully",
        comment,
      })
    } catch (error) {
      console.error("Update comment error:", error)
      res.status(500).json({ message: "Server error updating comment" })
    }
  },
)

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (only comment owner)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" })
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: req.params.id })

    // Delete the comment
    await Comment.findByIdAndDelete(req.params.id)

    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ message: "Server error deleting comment" })
  }
})

// @route   POST /api/comments/:id/like
// @desc    Like/unlike a comment
// @access  Private
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    // Check if user already liked the comment
    const existingLikeIndex = comment.likes.findIndex((like) => like.user.toString() === req.user._id.toString())

    if (existingLikeIndex > -1) {
      // Unlike the comment
      comment.likes.splice(existingLikeIndex, 1)
    } else {
      // Like the comment
      comment.likes.push({ user: req.user._id })
    }

    await comment.save()

    res.json({
      message: existingLikeIndex > -1 ? "Comment unliked" : "Comment liked",
      likeCount: comment.likes.length,
      isLiked: existingLikeIndex === -1,
    })
  } catch (error) {
    console.error("Like comment error:", error)
    res.status(500).json({ message: "Server error liking comment" })
  }
})

module.exports = router
