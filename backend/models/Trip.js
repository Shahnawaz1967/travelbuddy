// Trip model - defines the structure of trip data
const mongoose = require("mongoose")

const tripSchema = new mongoose.Schema({
  // Basic trip information
  title: {
    type: String,
    required: [true, "Trip title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Trip description is required"],
    maxlength: [2000, "Description cannot exceed 2000 characters"],
  },

  // Location details
  location: {
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },

  // Trip duration
  duration: {
    days: {
      type: Number,
      required: [true, "Trip duration is required"],
      min: [1, "Trip must be at least 1 day"],
    },
  },

  // Cost breakdown
  costs: {
    transport: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    accommodation: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    food: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    activities: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    other: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY"],
    },
  },

  // Images
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      caption: {
        type: String,
        maxlength: [200, "Caption cannot exceed 200 characters"],
      },
      cloudinaryId: String, // For deletion from Cloudinary
    },
  ],

  // Travel tips and advice
  tips: [
    {
      type: String,
      maxlength: [500, "Tip cannot exceed 500 characters"],
    },
  ],

  // Common mistakes to avoid
  mistakes: [
    {
      type: String,
      maxlength: [500, "Mistake description cannot exceed 500 characters"],
    },
  ],

  // User who created this trip
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Engagement metrics
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

  // Trip rating (1-5 stars)
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },

  // Trip status
  isPublished: {
    type: Boolean,
    default: true,
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
tripSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Calculate total cost
tripSchema.virtual("totalCost").get(function () {
  return this.costs.transport + this.costs.accommodation + this.costs.food + this.costs.activities + this.costs.other
})

// Get like count
tripSchema.virtual("likeCount").get(function () {
  return this.likes.length
})

// Ensure virtual fields are serialized
tripSchema.set("toJSON", { virtuals: true })

module.exports = mongoose.model("Trip", tripSchema)
