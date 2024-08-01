const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consultation",
    required: true,
  },
  sender: { type: String, required: true }, // Could be 'user' or 'astrologer'
  message: { type: String, required: true }, // Encrypted message
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
