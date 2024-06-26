const mongoose = require("mongoose");

const AstrologerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  specializations: { type: [String], required: true },
  ratings: {
    average: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  availability: {
    days: { type: [String], required: true },
    timeSlots: { type: [String], required: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Astrologer", AstrologerSchema);
