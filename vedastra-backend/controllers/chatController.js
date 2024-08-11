const cryptoUtils = require("../utils/cryptoUtils");
const ChatModel = require("../models/Chat");
const Consultation = require("../models/Consultation");

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
      ? req.astrologer.id
      : null;
    const senderType = req.user ? "User" : req.astrologer ? "Astrologer" : null;

    if (!senderId || !senderType) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    let receiverPublicKey, receiverId;
    if (senderType === "User") {
      receiverPublicKey = consultation.astrologerPublicKey;
      receiverId = consultation.astrologerId;
    } else if (senderType === "Astrologer") {
      receiverPublicKey = consultation.userPublicKey;
      receiverId = consultation.userId;
    }

    if (!receiverPublicKey) {
      return res
        .status(400)
        .send("Receiver public key not found in consultation");
    }

    const sharedSecret = Buffer.from(consultation.sharedSecret, "hex");

    const { iv, encryptedMessage } = cryptoUtils.encryptMessage(
      message,
      sharedSecret
    );

    let chat = await ChatModel.findOne({ consultationId });
    if (!chat) {
      chat = new ChatModel({ consultationId, messages: [] });
    }

    chat.messages.push({
      senderId,
      receiverId,
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

    if (!senderType) {
      return res.status(400).send("Sender type not found");
    }

    const sharedSecret = Buffer.from(consultation.sharedSecret, "hex");

    const decryptedMessages = chat.messages.map((msg) => {
      const decryptedMessage = cryptoUtils.decryptMessage(
        msg.message,
        sharedSecret,
        msg.iv
      );
      return {
        ...msg._doc, // Use _doc to access the raw document data
        message: decryptedMessage,
      };
    });

    // Log only relevant message data
    // console.log(
    //   "All decrypted messages:",
    //   decryptedMessages.map(({ senderId, receiverId, message, createdAt }) => ({
    //     senderId,
    //     receiverId,
    //     message,
    //     createdAt,
    //   }))
    // );

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).send("Error fetching chat messages");
  }
};

module.exports = {
  getChatMessages,
  sendMessage,
};
