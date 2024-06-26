const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post("/register", userController.registerUser);

// @route   POST api/users/login
// @desc    Login user
// @access  Public
router.post("/login", userController.loginUser);

// @route   GET api/users/me
// @desc    Get user profile
// @access  Private
router.get("/me", authMiddleware, userController.getUserProfile);

module.exports = router;
