const express = require("express");
const {
  getConsultations,
  updateConsultationStatus,
  getLiveConsultations,
  startConsultation,
  getConsultationById, // Import the new function
} = require("../controllers/consultationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to start a consultation
router.post("/start", authMiddleware, startConsultation);
router.get("/live", authMiddleware, getLiveConsultations);

// Route to get consultation details by ID
router.get("/:id", authMiddleware, getConsultationById); // Add this route

// Other routes
router.get("/", authMiddleware, getConsultations);
router.patch("/:id/status", authMiddleware, updateConsultationStatus);

module.exports = router;
