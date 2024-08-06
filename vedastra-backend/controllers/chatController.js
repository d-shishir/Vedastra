const ChatModel = require("../models/Chat");

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

// Send a new message in a chat
const sendMessage = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id; // Assuming user is attached to req by auth middleware
    const receiverId = req.body.receiverId;

    if (!message || !receiverId) {
      return res
        .status(400)
        .json({ msg: "Message and receiverId are required" });
    }

    const chat = await ChatModel.findOneAndUpdate(
      { consultationId },
      { $push: { messages: { senderId, receiverId, message } } },
      { new: true, upsert: true }
    );

    res.status(200).json(chat.messages);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send("Error sending message");
  }
};

// Start a chat (initialize or create if it doesn't exist)
const startChat = async (req, res) => {
  try {
    const { consultationId } = req.params;

    // Check if the chat already exists
    let chat = await ChatModel.findOne({ consultationId });

    if (!chat) {
      // Create a new chat if it doesn't exist
      chat = new ChatModel({ consultationId, messages: [] });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).send("Error starting chat");
  }
};

module.exports = {
  getChatMessages,
  sendMessage,
  startChat,
};
