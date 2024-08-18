const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const Astrologer = require("../models/Astrologer");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to parse JSON bodies
const app = express();
app.use(express.json()); // Ensure this is set up

// Admin login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      console.log("Username is undefined");
      return res.status(400).json({ message: "Username is required" });
    }

    // Find the admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log(`Admin not found with username: ${username}`);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password Match:", isMatch); // Log password comparison result
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Respond with the token
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Middleware to verify token and check admin role
// Ensure these middlewares are properly defined and imported
// router.use(verifyToken);
// router.use(isAdmin);

// Route to verify an astrologer
router.post("/verifyAstrologer/:id", async (req, res) => {
  try {
    const astrologerId = req.params.id;
    const astrologer = await Astrologer.findById(astrologerId);

    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found" });
    }

    astrologer.verified = true;
    await astrologer.save();

    res.status(200).json({ message: "Astrologer verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying astrologer", error });
  }
});

// Route to view dashboard (e.g., list of all astrologers)
router.get("/dashboard", async (req, res) => {
  try {
    const astrologers = await Astrologer.find();
    res.status(200).json({ astrologers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
});

// Route to get an astrologer's document
router.get("/getDocument/:id", async (req, res) => {
  try {
    const astrologerId = req.params.id;
    const astrologer = await Astrologer.findById(astrologerId);

    if (!astrologer || !astrologer.document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Assuming you have a field in the astrologer model that stores the document URL or path
    res.status(200).json({ documentUrl: astrologer.document });
  } catch (error) {
    res.status(500).json({ message: "Error fetching document", error });
  }
});

module.exports = router;
