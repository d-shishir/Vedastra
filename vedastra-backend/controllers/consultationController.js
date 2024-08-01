const ConsultationModel = require("../models/Consultation");

// Schedule a new consultation
const scheduleConsultation = async (req, res) => {
  try {
    const { astrologerId, scheduledAt, communicationType } = req.body;

    const newConsultation = new ConsultationModel({
      userId: req.user.id,
      astrologerId,
      scheduledAt,
      communicationType,
      status: "scheduled",
    });

    await newConsultation.save();
    res.status(200).json({
      message: "Consultation scheduled successfully",
      consultation: newConsultation,
    });
  } catch (error) {
    console.error("Error scheduling consultation:", error);
    res.status(500).send("Error scheduling consultation");
  }
};

// Get consultations for a user or astrologer
const getConsultations = async (req, res) => {
  try {
    const { userId, astrologerId } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (astrologerId) query.astrologerId = astrologerId;

    const consultations = await ConsultationModel.find(query).populate(
      "userId astrologerId"
    );

    res.status(200).json(consultations);
  } catch (error) {
    console.error("Error fetching consultations:", error);
    res.status(500).send("Error fetching consultations");
  }
};

// Update consultation status (e.g., completed, canceled)
const updateLiveConsultations = async () => {
  const now = new Date();
  try {
    const liveConsultations = await ConsultationModel.updateMany(
      {
        scheduledAt: { $lte: now },
        status: "scheduled",
      },
      { $set: { status: "live" } }
    );
    console.log(`${liveConsultations.nModified} consultations set to live.`);
  } catch (error) {
    console.error("Error updating live consultations:", error);
  }
};

// Get pending consultations
const getPendingConsultations = async (req, res) => {
  try {
    const { astrologerId } = req.query;
    const query = { status: "pending" };
    if (astrologerId) query.astrologerId = astrologerId;

    const consultations = await ConsultationModel.find(query).populate(
      "userId astrologerId"
    );

    res.status(200).json(consultations);
  } catch (error) {
    console.error("Error fetching pending consultations:", error);
    res.status(500).send("Error fetching pending consultations");
  }
};

module.exports = {
  scheduleConsultation,
  getConsultations,
  updateConsultationStatus,
  getPendingConsultations,
};
