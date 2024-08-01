const ChatModel = require("../models/ChatModel");
const { encryptMessage, decryptMessage } = require("../utils/encryption");

// Save a new message
const saveMessage = async (req, res) => {
  try {
    const { message, recipientId } = req.body;
    const encryptedMessage = encryptMessage(message);

    const newMessage = new ChatModel({
      senderId: req.user.id,
      recipientId,
      message: encryptedMessage.content,
      iv: encryptedMessage.iv,
      timestamp: Date.now(),
    });

    await newMessage.save();
    res.status(200).send("Message saved successfully");
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).send("Error saving message");
  }
};

// Get messages between two users
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await ChatModel.find({ chatId });

    const decryptedMessages = messages.map((msg) => ({
      ...msg._doc,
      message: decryptMessage({ content: msg.message, iv: msg.iv }),
    }));

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).send("Error retrieving messages");
  }
};

module.exports = { saveMessage, getMessages };
