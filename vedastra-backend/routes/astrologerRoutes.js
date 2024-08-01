const express = require("express");
const router = express.Router();
const astrologerController = require("../controllers/astrologerController");
const authMiddleware = require("../middlewares/authMiddleware");

// @route   POST api/astrologers/register
// @desc    Register astrologer
// @access  Public
router.post("/register", astrologerController.registerAstrologer);

// @route   POST api/astrologers/login
// @desc    Login astrologer
// @access  Public
router.post("/login", astrologerController.loginAstrologer);

// @route   GET api/astrologers/me
// @desc    Get astrologer profile
// @access  Private
router.get("/me", authMiddleware, astrologerController.getAstrologerProfile);

// @route   GET api/astrologers
// @desc    Get all astrologers
// @access  Public
router.get("/", astrologerController.getAllAstrologers);

// @route   GET api/astrologers/:id
// @desc    Get astrologer by ID
// @access  Public
router.get("/:id", astrologerController.getAstrologerById);

// Route to update availability
router.patch(
  "/me/availability",
  authMiddleware,
  astrologerController.updateAstrologerAvailability
);

module.exports = router;
