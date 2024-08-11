const express = require("express");
const {
  getConsultations,
  updateConsultationStatus,
  getLiveConsultations,
  startConsultation,
  getConsultationById,
  endConsultation,
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
router.patch("/:id/end", authMiddleware, endConsultation);

module.exports = router;
