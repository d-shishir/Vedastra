const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consultation",
    required: true,
  },
  messages: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      senderIdType: {
        type: String,
        enum: ["User", "Astrologer"],
        required: true,
      },
      receiverIdType: {
        type: String,
        enum: ["User", "Astrologer"],
        required: true,
      },
      message: {
        type: String,
        required: true, // Ensure this is not missing
      },
      iv: {
        type: String,
        required: true, // Ensure this is not missing
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Virtual for sender
ChatSchema.virtual("sender", {
  refPath: "messages.senderIdType", // Use dynamic reference path
  localField: "messages.senderId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for receiver
ChatSchema.virtual("receiver", {
  refPath: "messages.receiverIdType", // Use dynamic reference path
  localField: "messages.receiverId",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Chat", ChatSchema);
