const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", authController.registerUser);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", authController.loginUser);

// @route   GET api/auth/me
// @desc    Get user profile
// @access  Private
router.get("/me", authMiddleware, authController.getUserProfile);

// @route   GET api/auth/profile/:role/:id
// @desc    Get profile based on role
// @access  Private
router.get(
  "/profile/:role/:id",
  authMiddleware,
  authController.getProfileByRole
);

module.exports = router;
