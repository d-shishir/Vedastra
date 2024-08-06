const express = require("express");
const {
  getChatMessages,
  sendMessage,
  startChat,
} = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to get messages for a chat
router.get("/:consultationId/messages", authMiddleware, getChatMessages);

// Route to send a new message
router.post("/:consultationId/messages", authMiddleware, sendMessage);

// Route to start a chat (initialize chat or create if it doesn't exist)
router.post("/:consultationId/start", authMiddleware, startChat);

module.exports = router;
