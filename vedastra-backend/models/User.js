const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthdate: { type: Date, required: true },
  birthplace: { type: String },
  profilePicture: { type: String },
  preferences: [String],
  // Location fields (example)
  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
