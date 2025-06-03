// Authentication routes - register, login, profile
const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    // Validation rules
    body("username")
      .isLength({ min: 3, max: 20 })
      .withMessage("Username must be between 3 and 20 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("firstName").optional().isLength({ max: 50 }).withMessage("First name cannot exceed 50 characters"),
    body("lastName").optional().isLength({ max: 50 }).withMessage("Last name cannot exceed 50 characters"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { username, email, password, firstName, lastName } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      })

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === email ? "Email already registered" : "Username already taken",
        })
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName,
      })

      await user.save()

      // Generate token
      const token = generateToken(user._id)

      // Return user data (without password) and token
      res.status(201).json({
        message: "User registered successfully",
        token,
        user: user.getPublicProfile(),
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({
        message: "Server error during registration",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  },
)

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email, password } = req.body

      // Find user by email
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({
          message: "Invalid email or password",
        })
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(400).json({
          message: "Invalid email or password",
        })
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      // Generate token
      const token = generateToken(user._id)

      res.json({
        message: "Login successful",
        token,
        user: user.getPublicProfile(),
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        message: "Server error during login",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  },
)

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.getPublicProfile(),
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ message: "Server error fetching profile" })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  [
    authenticateToken,
    body("firstName").optional().isLength({ max: 50 }).withMessage("First name cannot exceed 50 characters"),
    body("lastName").optional().isLength({ max: 50 }).withMessage("Last name cannot exceed 50 characters"),
    body("bio").optional().isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters"),
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

      const { firstName, lastName, bio } = req.body

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName, bio },
        { new: true, runValidators: true },
      )

      res.json({
        message: "Profile updated successfully",
        user: updatedUser.getPublicProfile(),
      })
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({ message: "Server error updating profile" })
    }
  },
)

module.exports = router
