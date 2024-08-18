const Astrologer = require("../models/Astrologer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadDocument } = require("../middlewares/uploadMiddleware"); // Middleware to handle file uploads
const Review = require("../models/Review");
const User = require("../models/User");
const astrologerRecommendation = require("../utils/recommendAstrologers");

// Astrologer registration
exports.registerAstrologer = async (req, res) => {
  const { name, email, password, specializations } = req.body;
  const document = req.file ? req.file.path : null; // Assuming `uploadDocument` middleware sets `req.file`

  if (!name || !email || !password || !specializations) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    let astrologer = await Astrologer.findOne({ email });
    if (astrologer) {
      return res.status(400).json({ msg: "Astrologer already exists" });
    }

    astrologer = new Astrologer({
      name,
      email,
      password,
      specializations,
      document, // Include the document path
      verified: false, // Set default to false until verified
    });

    const salt = await bcrypt.genSalt(10);
    astrologer.password = await bcrypt.hash(password, salt);
    await astrologer.save();

    const payload = {
      astrologer: {
        id: astrologer.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Astrologer login
exports.loginAstrologer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    let astrologer = await Astrologer.findOne({ email });
    if (!astrologer) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, astrologer.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      astrologer: {
        id: astrologer.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get astrologer profile
exports.getAstrologerProfile = async (req, res) => {
  try {
    // Ensure req.astrologer is set correctly by middleware
    if (!req.astrologer || !req.astrologer.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const astrologer = await Astrologer.findById(req.astrologer.id).select(
      "-password"
    );

    if (!astrologer) {
      return res.status(404).json({ msg: "Astrologer not found" });
    }

    res.json(astrologer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get all astrologers
exports.getAllAstrologers = async (req, res) => {
  try {
    const astrologers = await Astrologer.find().select("-password");
    res.json(astrologers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get astrologer by ID
exports.getAstrologerById = async (req, res) => {
  try {
    const astrologer = await Astrologer.findById(req.params.id)
      .select("-password")
      .populate("reviews");

    if (!astrologer) {
      return res.status(404).json({ msg: "Astrologer not found" });
    }

    res.json(astrologer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Update availability
exports.updateAvailability = async (req, res) => {
  try {
    const astrologerId = req.astrologer.id; // Use req.astrologer.id instead of req.user._id
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ msg: "Invalid availability status" });
    }

    const updatedAstrologer = await Astrologer.findByIdAndUpdate(
      astrologerId,
      { isAvailable },
      { new: true }
    );

    if (!updatedAstrologer) {
      return res.status(404).send("Astrologer not found");
    }

    res.status(200).json(updatedAstrologer);
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).send("Error updating availability");
  }
};

// Update verification status
exports.updateVerificationStatus = async (req, res) => {
  try {
    const astrologerId = req.user.id; // Assuming astrologer is logged in and authenticated
    const { verified } = req.body;

    if (typeof verified !== "boolean") {
      return res.status(400).json({ msg: "Invalid verification status" });
    }

    const updatedAstrologer = await Astrologer.findByIdAndUpdate(
      astrologerId,
      { verified },
      { new: true }
    );

    if (!updatedAstrologer) {
      return res.status(404).send("Astrologer not found");
    }

    res.status(200).json(updatedAstrologer);
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).send("Error updating verification status");
  }
};

// Add or update a review
exports.addReview = async (req, res) => {
  try {
    const { astrologerId, rating, comment } = req.body;
    console.log("Received review data:", req.body); // Log request body

    const userId = req.user.id; // Ensure userId is correctly set

    if (!astrologerId || !rating || !comment) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Fetch the user's details to get their name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const userName = user.name;

    // Check if the user has already reviewed this astrologer
    let review = await Review.findOne({
      astrologer: astrologerId,
      user: userId,
    });

    if (review) {
      // Update the existing review
      review.rating = rating;
      review.comment = comment;
      review.userName = userName; // Ensure userName is updated
      await review.save();
    } else {
      // Create a new review
      review = new Review({
        astrologer: astrologerId,
        user: userId,
        userName, // Add userName to the review
        rating,
        comment,
      });
      await review.save();

      // Add the new review to the astrologer's reviews
      const astrologer = await Astrologer.findById(astrologerId);
      if (!astrologer) {
        return res.status(404).json({ msg: "Astrologer not found" });
      }

      astrologer.reviews.push(review._id);
      astrologer.ratings.reviewsCount += 1;
      astrologer.ratings.average =
        (astrologer.ratings.average * (astrologer.ratings.reviewsCount - 1) +
          rating) /
        astrologer.ratings.reviewsCount;

      await astrologer.save();
    }

    // Update astrologer's ratings
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ msg: "Astrologer not found" });
    }

    astrologer.ratings.average =
      astrologer.ratings.reviewsCount === 0
        ? rating
        : (astrologer.ratings.average * (astrologer.ratings.reviewsCount - 1) +
            rating) /
          astrologer.ratings.reviewsCount;

    await astrologer.save();

    res.status(201).json({
      msg: "Review added or updated successfully",
      ratings: astrologer.ratings,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get reviews and ratings of an astrologer
exports.getReviewsAndRatings = async (req, res) => {
  try {
    const astrologerId = req.params.id;

    // Log request to ensure correct astrologerId
    console.log("Fetching reviews for astrologerId:", astrologerId);

    const astrologer = await Astrologer.findById(astrologerId).populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "name",
      },
    });

    // Log the retrieved astrologer and reviews
    console.log("Astrologer data:", astrologer);
    console.log("Reviews:", astrologer.reviews);

    if (!astrologer) {
      return res.status(404).json({ msg: "Astrologer not found" });
    }

    const reviews = astrologer.reviews.map((review) => ({
      ...review.toObject(),
      userName: review.user.name,
    }));
    const ratings = astrologer.ratings;

    res.json({ reviews, ratings });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Recommend astrologers to a user
exports.recommendAstrologersToUser = async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from request body
    console.log(userId);

    if (!userId) {
      throw new Error("User ID is missing from the request body");
    }

    const recommendedAstrologers = await astrologerRecommendation(userId);

    res.json(recommendedAstrologers);
    console.log(recommendedAstrologers);
  } catch (err) {
    console.error("Error recommending astrologers:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
