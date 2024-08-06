const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AstrologerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  specializations: [String],
  isAvailable: {
    type: Boolean,
    default: false,
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  document: {
    type: String, // Add this field to store the path of the uploaded document
    default: null,
  },
  verified: {
    type: Boolean,
    default: false, // Default to false until verified
  },
});

module.exports = mongoose.model("Astrologer", AstrologerSchema);
