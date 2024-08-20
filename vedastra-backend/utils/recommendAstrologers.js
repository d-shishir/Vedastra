const mongoose = require("mongoose");
const Astrologer = require("../models/Astrologer");
const User = require("../models/User");
const Review = require("../models/Review");

// Function to get recommendations for astrologers
async function astrologerRecommendation(userId) {
  try {
    // Fetch the user details
    const user = await User.findById(userId).populate("preferences");
    if (!user) {
      throw new Error("User not found");
    }

    // Find all available astrologers
    const astrologers = await Astrologer.find({ isAvailable: true }).populate(
      "reviews"
    );

    // Calculate ratings for each astrologer
    const astrologerRatings = astrologers.map((astrologer) => {
      const totalRatings = astrologer.reviews.length;
      const averageRating =
        totalRatings > 0
          ? astrologer.reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalRatings
          : 0;
      return {
        ...astrologer.toObject(),
        ratings: {
          ...astrologer.ratings,
          average: averageRating,
          reviewsCount: totalRatings,
        },
      };
    });

    // Rank astrologers based on user preferences and ratings
    const recommendedAstrologers = astrologerRatings
      .map((astrologer) => {
        // Calculate a score based on user preferences and ratings
        const preferenceScore = user.preferences.reduce(
          (score, preference) =>
            astrologer.specializations.includes(preference) ? score + 1 : score,
          0
        );
        const ratingScore = astrologer.ratings.average;

        return {
          ...astrologer,
          score: preferenceScore * 2 + ratingScore * 1, // Adjust weights as needed
        };
      })
      .sort((a, b) => b.score - a.score); // Sort by score in descending order

    return recommendedAstrologers;
  } catch (error) {
    console.error("Error recommending astrologers:", error.message);
    throw error;
  }
}

module.exports = astrologerRecommendation;
