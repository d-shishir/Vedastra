const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthdate: { type: Date, required: true },
  birthplace: { type: String },
  profilePicture: { type: String },
  preferences: {
    dailyHoroscope: { type: Boolean, default: true },
    personalizedReadings: { type: Boolean, default: true },
  },
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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
