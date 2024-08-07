const ChatModel = require("../models/Chat");
const Consultation = require("../models/Consultation"); // Adjust path as needed

// Send a new message in a chat
const sendMessage = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { message } = req.body;

    // Ensure message is provided
    if (!message) {
      return res.status(400).json({ msg: "Message is required" });
    }

    // Fetch consultation to get userId and astrologerId
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).send("Consultation not found");
    }

    // Determine senderId and receiverId based on the authenticated user
    const senderId = req.user
      ? req.user._id
      : req.astrologer
      ? req.astrologer._id
      : null;
    const senderType = req.user ? "User" : req.astrologer ? "Astrologer" : null;

    if (!senderId || !senderType) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    // Determine the receiverId and receiverType
    let receiverId;
    let receiverType;

    if (senderType === "User") {
      receiverId = consultation.astrologerId;
      receiverType = "Astrologer";
    } else if (senderType === "Astrologer") {
      receiverId = consultation.userId;
      receiverType = "User";
    }

    // Find or create the chat
    let chat = await ChatModel.findOne({ consultationId });

    if (!chat) {
      // Create a new chat if it doesn't exist
      chat = new ChatModel({ consultationId, messages: [] });
      await chat.save();
    }

    // Update the chat with the new message
    chat.messages.push({
      senderId,
      receiverId,
      message,
      senderType,
      receiverType,
    });

    await chat.save();

    // Respond with the updated messages
    res.status(200).json(chat.messages);
  } catch (error) {
    console.error("Error sending message:", error);
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

    res.status(200).json(chat.messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).send("Error fetching chat messages");
  }
};

module.exports = {
  getChatMessages,
  sendMessage,
};
