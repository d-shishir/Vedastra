// routes/dailyHoroscopeRoutes.js
const express = require("express");
const router = express.Router();
const dailyHoroscopeController = require("../controllers/dailyHoroscopeController");
const authMiddleware = require("../middlewares/authMiddleware");

// @route   POST api/dailyHoroscopes
// @desc    Create a daily horoscope
// @access  Private (Admin only)
router.post("/", authMiddleware, dailyHoroscopeController.createDailyHoroscope);

// @route   GET api/dailyHoroscopes
// @desc    Get daily horoscopes
// @access  Public
router.get("/", dailyHoroscopeController.getDailyHoroscopes);

module.exports = router;
