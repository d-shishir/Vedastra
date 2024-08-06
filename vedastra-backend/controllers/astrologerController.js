const Astrologer = require("../models/Astrologer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadDocument } = require("../middlewares/uploadMiddleware"); // Middleware to handle file uploads

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
    const astrologer = await Astrologer.findById(req.params.id).select(
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
