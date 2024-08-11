const mongoose = require("mongoose");

const ConsultationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  astrologerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Astrologer",
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["live", "completed"],
    default: "live",
  },
  communicationType: {
    type: String,
    enum: ["chat", "video"],
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  review: {
    type: String,
  },
  userPublicKey: {
    type: String, // Store the public key as a string
  },
  astrologerPublicKey: {
    type: String, // Store the public key as a string
  },
  sharedSecret: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add an update hook to automatically set the updatedAt field
ConsultationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Consultation", ConsultationSchema);
