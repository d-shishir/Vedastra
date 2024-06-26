const Consultation = require("../models/Consultation");

// Schedule a consultation
exports.scheduleConsultation = async (req, res) => {
  const { userId, astrologerId, scheduledAt, communicationType } = req.body;

  try {
    const newConsultation = new Consultation({
      userId,
      astrologerId,
      scheduledAt,
      communicationType,
    });

    const consultation = await newConsultation.save();
    res.json(consultation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get consultations for a user
exports.getUserConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ userId: req.user.id });
    res.json(consultations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get consultations for an astrologer
exports.getAstrologerConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      astrologerId: req.astrologer.id,
    });
    res.json(consultations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
