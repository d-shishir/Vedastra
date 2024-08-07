const ChatModel = require("../models/Chat");
const Consultation = require("../models/Consultation"); // Adjust path as needed

// Send a new message in a chat
const sendMessage = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ msg: "Message is required" });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).send("Consultation not found");
    }

    const senderId = req.user
      ? req.user.id
      : req.astrologer
      ? req.astrologer.id // Access the id field from astrologer
      : null;
    const senderType = req.user ? "User" : req.astrologer ? "Astrologer" : null;

    if (!senderId || !senderType) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    let receiverId;
    let receiverType;

    if (senderType === "User") {
      receiverId = consultation.astrologerId;
      receiverType = "Astrologer";
    } else if (senderType === "Astrologer") {
      receiverId = consultation.userId;
      receiverType = "User";
    }

    let chat = await ChatModel.findOne({ consultationId });

    if (!chat) {
      chat = new ChatModel({ consultationId, messages: [] });
      await chat.save();
    }

    chat.messages.push({
      senderId,
      receiverId,
      message,
      senderIdType: senderType,
      receiverIdType: receiverType,
    });

    await chat.save();

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
