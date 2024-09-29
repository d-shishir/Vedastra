const Consultation = require("../models/Consultation"); // Adjust the path as needed
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const cryptoUtils = require("../utils/cryptoUtils");

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

    // Validate request body
    if (!astrologerId || !communicationType) {
      return res
        .status(400)
        .json({ message: "astrologerId and communicationType are required" });
    }

    // Generate key pairs for the user and the astrologer
    const { publicKey: userPublicKey, privateKey: userPrivateKey } =
      cryptoUtils.generateKeyPair();
    const { publicKey: astrologerPublicKey, privateKey: astrologerPrivateKey } =
      cryptoUtils.generateKeyPair();

    // Derive the shared secret using Diffie-Hellman
    const sharedSecret = cryptoUtils.deriveSecret(
      userPrivateKey,
      astrologerPublicKey
    );
    const encryptedSharedSecret = sharedSecret.toString("hex"); // Convert the shared secret to hex format

    // Create a new consultation record
    const newConsultation = new Consultation({
      userId,
      astrologerId,
      scheduledAt: new Date(),
      status: "live", // Set the status to "live"
      communicationType,
      userPublicKey,
      astrologerPublicKey,
      sharedSecret: encryptedSharedSecret, // Store the shared secret
    });

    // Save the new consultation to the database
    await newConsultation.save();

    // Create an empty chat session for this consultation
    const newChat = new Chat({
      consultationId: newConsultation._id, // Link the chat to the consultation
      messages: [], // Initialize with an empty messages array
    });

    // Save the new chat session to the database
    await newChat.save();

    // Respond with the consultation and chat details
    res.status(201).json({
      consultationId: newConsultation._id, // Explicitly include consultationId
      chatId: newChat._id, // Include chatId in the response
      consultation: newConsultation,
      chat: newChat,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error starting consultation:", error);

    // Send a server error response
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

// End a consultation (set status to completed)
const endConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid ID format" });
    }

    const updatedConsultation = await Consultation.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true }
    );
    if (!updatedConsultation) {
      return res.status(404).send("Consultation not found");
    }
    res.status(200).json(updatedConsultation);
  } catch (error) {
    console.error("Error ending consultation:", error);
    res.status(500).send("Error ending consultation");
  }
};

module.exports = {
  getConsultations,
  updateConsultationStatus,
  getLiveConsultations,
  startConsultation,
  getConsultationById,
  endConsultation,
};
