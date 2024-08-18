const express = require("express");
const router = express.Router();
const astrologerController = require("../controllers/astrologerController");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadDocument } = require("../middlewares/uploadMiddleware"); // Import file upload middleware

// @route   POST api/astrologers/register
// @desc    Register astrologer
// @access  Public
router.post(
  "/register",
  uploadDocument,
  astrologerController.registerAstrologer
);

// @route   POST api/astrologers/login
// @desc    Login astrologer
// @access  Public
router.post("/login", astrologerController.loginAstrologer);

// @route   GET api/astrologers/me
// @desc    Get astrologer profile
// @access  Private
router.get("/me", authMiddleware, astrologerController.getAstrologerProfile);

// @route   GET api/astrologers/recommend
// @desc    Recommend astrologers to the user
// @access  Private
router.get(
  "/recommend",
  authMiddleware,
  astrologerController.recommendAstrologersToUser
);

// @route   GET api/astrologers
// @desc    Get all astrologers or filter by availability
// @access  Public
router.get("/", astrologerController.getAllAstrologers);

// @route   POST /api/astrologers/:id/reviews
// @desc    Add a review for an astrologer
// @access  Private
router.post("/:id/reviews", authMiddleware, astrologerController.addReview);

// @route   GET /api/astrologers/:id/reviews
// @desc    Get reviews and ratings of an astrologer
// @access  Public
router.get("/:id/reviews", astrologerController.getReviewsAndRatings);

// @route   GET api/astrologers/:id
// @desc    Get astrologer by ID
// @access  Public
router.get("/:id", astrologerController.getAstrologerById);

// @route   PATCH api/astrologers/me/availability
// @desc    Update astrologer availability status
// @access  Private
router.patch(
  "/me/availability",
  authMiddleware,
  astrologerController.updateAvailability
);

// @route   PATCH api/astrologers/me/verification
// @desc    Update astrologer verification status
// @access  Private
router.patch(
  "/me/verification",
  authMiddleware,
  astrologerController.updateVerificationStatus
);

module.exports = router;
