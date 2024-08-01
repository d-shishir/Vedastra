const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AstrologerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specializations: [String],
  availability: {
    days: [{ type: String, required: true }], // Ensure days are required
    timeSlots: [{ type: String, required: true }], // Ensure timeSlots are required
  },
  ratings: {
    average: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("Astrologer", AstrologerSchema);
