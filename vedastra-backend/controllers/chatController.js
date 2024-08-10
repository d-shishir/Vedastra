const crypto = require("crypto");
const ChatModel = require("../models/Chat");
const Consultation = require("../models/Consultation"); // Adjust path as needed

const {
  generateKeyPair,
  deriveSecret,
  encryptMessage,
  decryptMessage,
} = require("../utils/cryptoUtils");

// Send a new message in a chat
const sendMessage = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { message } = req.body;

    // Validate message
    if (!message) {
      console.log("Message is missing from the request body.");
      return res.status(400).json({ msg: "Message is required" });
    }

    // Find consultation
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      console.log(`Consultation with ID ${consultationId} not found.`);
      return res.status(404).send("Consultation not found");
    }

    // Determine sender information
    const senderId = req.user
      ? req.user.id
      : req.astrologer
      ? req.astrologer.id
      : null;
    const senderType = req.user ? "User" : req.astrologer ? "Astrologer" : null;

    if (!senderId || !senderType) {
      console.log("User or Astrologer ID is missing.");
      return res.status(401).json({ msg: "User not authenticated" });
    }

    // Determine receiver public key
    let receiverPublicKey, receiverId;
    if (senderType === "User") {
      receiverPublicKey = consultation.astrologerPublicKey;
      receiverId = consultation.astrologerId; // Set receiverId for user
    } else if (senderType === "Astrologer") {
      receiverPublicKey = consultation.userPublicKey;
      receiverId = consultation.userId; // Set receiverId for astrologer
    }

    if (!receiverPublicKey) {
      console.log("Receiver public key not found in consultation.");
      return res.status(400).send("Receiver public key not found");
    }

    // Generate key pairs
    const {
      publicKey: senderPublicKey,
      privateKey: senderPrivateKey,
      dh: senderDh,
    } = generateKeyPair();

    // Derive the shared secret
    const sharedSecret = deriveSecret(
      senderPrivateKey,
      receiverPublicKey,
      senderDh
    );

    // Encrypt the message
    const { iv, encryptedMessage } = encryptMessage(message, sharedSecret);

    // Find or create chat
    let chat = await ChatModel.findOne({ consultationId });
    if (!chat) {
      chat = new ChatModel({ consultationId, messages: [] });
    }

    chat.messages.push({
      senderId,
      receiverId, // Ensure receiverId is set
      message: encryptedMessage,
      iv,
      senderIdType: senderType,
      receiverIdType: senderType === "User" ? "Astrologer" : "User",
    });

    await chat.save();
    res.status(200).json(chat.messages);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res
      .status(500)
      .json({ msg: "Error sending message", error: error.message });
  }
};

// Get chat messages for a consultation
const getChatMessages = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const chat = await ChatModel.findOne({ consultationId });
    if (!chat) {
      return res.status(404).send("Chat not found");
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).send("Consultation not found");
    }

    const senderId = req.user
      ? req.user.id
      : req.astrologer
      ? req.astrologer.id
      : null;
    const senderType = req.user ? "User" : req.astrologer ? "Astrologer" : null;
    let receiverPublicKey =
      senderType === "User"
        ? consultation.astrologerPublicKey
        : consultation.userPublicKey;

    if (!receiverPublicKey) {
      return res.status(400).send("Receiver public key not found");
    }

    const { privateKey: senderPrivateKey, dh } = generateKeyPair();
    const sharedSecret = deriveSecret(senderPrivateKey, receiverPublicKey, dh);

    const decryptedMessages = chat.messages.map((msg) => {
      return {
        ...msg,
        message: decryptMessage(msg.message, sharedSecret, msg.iv),
      };
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).send("Error fetching chat messages");
  }
};

// Function to get a user's private key (implement according to your storage logic)
const getPrivateKey = async (userId, userType) => {
  // Fetch and return the private key for the given user
  // This is a placeholder implementation
  throw new Error("getPrivateKey function is not implemented");
};

module.exports = {
  getChatMessages,
  sendMessage,
};
