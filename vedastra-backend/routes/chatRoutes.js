const express = require("express");
const {
  getChatMessages,
  sendMessage,
} = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to get messages for a chat
router.get("/:consultationId/messages", authMiddleware, getChatMessages);

// Route to send a new message (this now also handles chat initialization)
router.post("/:consultationId/messages", authMiddleware, sendMessage);

module.exports = router;
