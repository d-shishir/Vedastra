const User = require("../models/User");
const Astrologer = require("../models/Astrologer");
const Review = require("../models/Review");
const mongoose = require("mongoose");

const recommendAstrologers = async (userId) => {
  try {
    console.log("start");
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Fetch astrologers and populate reviews
    const astrologers = await Astrologer.find().populate("reviews");

    // Calculate content-based scores
    const contentBasedScores = astrologers.map((astrologer) => {
      const similarityScore = calculateSimilarity(
        user.preferences,
        astrologer.specializations
      );
      return { astrologer, score: similarityScore };
    });

    // Calculate collaborative scores
    const collaborativeScores = await predictUserRatings(userId, astrologers);

    // Combine scores and sort
    const combinedScores = astrologers.map((astrologer, index) => {
      const combinedScore =
        0.5 * contentBasedScores[index].score +
        0.5 * collaborativeScores[index];
      return { astrologer, score: combinedScore };
    });

    return combinedScores
      .sort((a, b) => b.score - a.score)
      .map((item) => item.astrologer);
  } catch (error) {
    console.error("Error recommending astrologers:", error);
    throw error;
  }
};

// Calculate similarity score
const calculateSimilarity = (preferences = {}, specializations = []) => {
  const preferencesSet = new Set(
    Object.keys(preferences).filter((key) => preferences[key])
  );
  const specializationsSet = new Set(specializations);

  const intersection = new Set(
    [...preferencesSet].filter((x) => specializationsSet.has(x))
  );
  const union = new Set([...preferencesSet, ...specializationsSet]);

  return union.size === 0 ? 0 : intersection.size / union.size;
};

// Predict user ratings
const predictUserRatings = async (userId, astrologers) => {
  try {
    const userRatings = await Review.find({ user: userId });
    const ratingsMap = userRatings.reduce((map, review) => {
      map[review.astrologer.toString()] = review.rating;
      return map;
    }, {});

    return astrologers.map((astrologer) => {
      console.log(astrologer._id);
      const pastRating = ratingsMap[astrologer._id.toString()] || 0;
      const overallAverage = astrologer.ratings?.average || 0;

      return (pastRating + overallAverage) / 2;
    });
  } catch (error) {
    console.error("Error predicting user ratings:", error);
    throw error;
  }
};

module.exports = {
  recommendAstrologers,
};
