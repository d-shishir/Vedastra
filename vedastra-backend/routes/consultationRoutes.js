const express = require("express");
const {
  getConsultations,
  updateConsultationStatus,
  getLiveConsultations,
} = require("../controllers/consultationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to get consultations for a user or astrologer
router.get("/", authMiddleware, getConsultations);

// Route to update consultation status by ID
router.patch("/:id/status", authMiddleware, updateConsultationStatus);

// Route to get live consultations
router.get("/live", authMiddleware, getLiveConsultations); // Make sure this is defined

module.exports = router;
