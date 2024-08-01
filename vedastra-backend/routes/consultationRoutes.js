const express = require("express");
const {
  scheduleConsultation,
  getConsultations,
  updateConsultationStatus,
  getPendingConsultations,
} = require("../controllers/consultationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to schedule a new consultation
router.post("/schedule", authMiddleware, scheduleConsultation);

// Route to get consultations for a user or astrologer
router.get("/", authMiddleware, getConsultations);

// Route to update consultation status
router.patch("/status", authMiddleware, updateConsultationStatus);

// Route to get pending consultations
router.get("/pending", authMiddleware, getPendingConsultations);

module.exports = router;
