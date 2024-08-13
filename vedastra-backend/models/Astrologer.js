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
    type: String,
    default: null,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }], // Reference to reviews
});

module.exports = mongoose.model("Astrologer", AstrologerSchema);
