// Comment model - for trip comments and Q&A
const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
  // Comment content
  content: {
    type: String,
    required: [true, "Comment content is required"],
    trim: true,
    maxlength: [1000, "Comment cannot exceed 1000 characters"],
  },

  // Reference to the trip this comment belongs to
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },

  // User who wrote the comment
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // For nested comments (replies)
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },

  // Comment type (question, answer, general)
  type: {
    type: String,
    enum: ["question", "answer", "general"],
    default: "general",
  },

  // Likes on comments
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Comment status
  isEdited: {
    type: Boolean,
    default: false,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
commentSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now()
    this.isEdited = true
  }
  next()
})

// Get like count
commentSchema.virtual("likeCount").get(function () {
  return this.likes.length
})

// Ensure virtual fields are serialized
commentSchema.set("toJSON", { virtuals: true })

module.exports = mongoose.model("Comment", commentSchema)
