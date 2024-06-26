const mongoose = require("mongoose");

const DailyHoroscopeSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  sign: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DailyHoroscope", DailyHoroscopeSchema);
