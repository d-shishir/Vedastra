const Consultation = require("../models/Consultation"); // Adjust the path as needed

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

// Update consultation status (e.g., completed, live)
const updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["completed", "live"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }
    const updatedConsultation = await ConsultationModel.findByIdAndUpdate(
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
    const liveConsultations = await ConsultationModel.find({
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
    const { astrologerId, communicationType } = req.body; // Extract required fields from request body
    const userId = req.user.id; // Assuming user ID is available in req.user

    // Check if both required fields are provided
    if (!astrologerId || !communicationType) {
      return res
        .status(400)
        .json({ message: "astrologerId and communicationType are required" });
    }

    // Proceed with your logic to start the consultation
  } catch (error) {
    console.error("Error starting consultation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getConsultations,
  updateConsultationStatus,
  getLiveConsultations,
  startConsultation,
};
