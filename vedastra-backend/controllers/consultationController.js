const Consultation = require("../models/Consultation"); // Adjust the path as needed
const mongoose = require("mongoose");

// Get consultations for a user or astrologer
const getConsultations = async (req, res) => {
  try {
    const { userId, astrologerId } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (astrologerId) query.astrologerId = astrologerId;
    const consultations = await Consultation.find(query).populate(
      "userId astrologerId"
    );
    res.status(200).json(consultations);
  } catch (error) {
    console.error("Error fetching consultations:", error);
    res.status(500).send("Error fetching consultations");
  }
};

// Update consultation status (e.g., completed, live)
const updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["completed", "live"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedConsultation) {
      return res.status(404).send("Consultation not found");
    }
    res.status(200).json(updatedConsultation);
  } catch (error) {
    console.error("Error updating consultation status:", error);
    res.status(500).send("Error updating consultation status");
  }
};

// Get live consultations
const getLiveConsultations = async (req, res) => {
  try {
    const now = new Date();
    const liveConsultations = await Consultation.find({
      scheduledAt: { $lte: now },
      status: "live",
    }).populate("userId astrologerId");
    res.status(200).json(liveConsultations);
  } catch (error) {
    console.error("Error fetching live consultations:", error);
    res.status(500).send("Error fetching live consultations");
  }
};

// Function to start a consultation
const startConsultation = async (req, res) => {
  try {
    const { astrologerId, communicationType } = req.body;
    const userId = req.user.id;

    if (!astrologerId || !communicationType) {
      return res
        .status(400)
        .json({ message: "astrologerId and communicationType are required" });
    }

    // Check if the user already has an active consultation
    const now = new Date();
    const liveConsultations = await Consultation.find({
      userId,
      scheduledAt: { $lte: now },
      status: "live",
    });

    if (liveConsultations.length > 0) {
      return res
        .status(400)
        .json({ message: "You already have an active consultation." });
    }

    const newConsultation = new Consultation({
      userId,
      astrologerId,
      scheduledAt: new Date(),
      status: "live",
      communicationType,
    });

    await newConsultation.save();
    res.status(201).json(newConsultation);
  } catch (error) {
    console.error("Error starting consultation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get consultation details by ID
const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid ID format" });
    }

    const consultation = await Consultation.findById(id).populate(
      "userId astrologerId"
    );
    if (!consultation) {
      return res.status(404).send("Consultation not found");
    }
    res.status(200).json(consultation);
  } catch (error) {
    console.error("Error fetching consultation details:", error);
    res.status(500).send("Error fetching consultation details");
  }
};

module.exports = {
  getConsultations,
  updateConsultationStatus,
  getLiveConsultations,
  startConsultation,
  getConsultationById,
};
