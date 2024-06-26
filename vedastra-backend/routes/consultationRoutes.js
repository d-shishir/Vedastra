const express = require("express");
const router = express.Router();
const consultationController = require("../controllers/consultationController");
const authMiddleware = require("../middlewares/authMiddleware");

// @route   POST api/consultations
// @desc    Schedule a consultation
// @access  Private
router.post("/", authMiddleware, consultationController.scheduleConsultation);

// @route   GET api/consultations/user
// @desc    Get consultations for a user
// @access  Private
router.get(
  "/user",
  authMiddleware,
  consultationController.getUserConsultations
);

// @route   GET api/consultations/astrologer
// @desc    Get consultations for an astrologer
// @access  Private
router.get(
  "/astrologer",
  authMiddleware,
  consultationController.getAstrologerConsultations
);

module.exports = router;
