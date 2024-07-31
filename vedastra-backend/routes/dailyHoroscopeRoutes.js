const express = require("express");
const router = express.Router();
const dailyHoroscopeController = require("../controllers/dailyHoroscopeController");
const authMiddleware = require("../middlewares/authMiddleware");

// @route   GET api/zodiac-sign
// @desc    Get zodiac sign for authenticated user
// @access  Private
router.get("/", authMiddleware, dailyHoroscopeController.getZodiacSignForUser);

module.exports = router;
