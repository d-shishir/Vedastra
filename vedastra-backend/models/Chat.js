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
        // This can reference either a User or an Astrologer
      },
      receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // This can also reference either a User or an Astrologer
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

// Ensure that senderId and receiverId can reference both User and Astrologer
ChatSchema.virtual("sender", {
  ref: "User", // You might need to use 'Astrologer' as well
  localField: "senderId",
  foreignField: "_id",
  justOne: true,
});

ChatSchema.virtual("receiver", {
  ref: "User", // You might need to use 'Astrologer' as well
  localField: "receiverId",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Chat", ChatSchema);
