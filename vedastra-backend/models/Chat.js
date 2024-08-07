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
        required: true,
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
  ref: function (doc) {
    return doc.senderIdType === "User" ? "User" : "Astrologer";
  },
  localField: "messages.senderId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for receiver
ChatSchema.virtual("receiver", {
  ref: function (doc) {
    return doc.receiverIdType === "User" ? "User" : "Astrologer";
  },
  localField: "messages.receiverId",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Chat", ChatSchema);
