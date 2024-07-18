const mongoose = require("mongoose");

const horoscopeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  horoscopeText: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Horoscope", horoscopeSchema);
