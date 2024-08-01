const express = require("express");
const { saveMessage, getMessages } = require("../controllers/chatController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to save a new chat message
router.post("/messages", authenticateUser, saveMessage);

// Route to get chat messages by chat ID
router.get("/messages/:chatId", authenticateUser, getMessages);

module.exports = router;
