const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const authController = {
  registerUser: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, birthdate, location } = req.body;
    const { city, state, country, latitude, longitude } = location;

    try {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        console.log(`User already exists: ${email}`);
        return res.status(400).json({ msg: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword, // Ensure hashed password is stored
        birthdate,
        birthplace: city,
        location: {
          city,
          state,
          country,
          latitude,
          longitude,
        },
      });

      await user.save();
      console.log(`User registered: ${email}`);

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(`Server Error: ${err.message}`);
      res.status(500).send("Server Error");
    }
  },

  // Login user
  loginUser: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        console.log(`User not found: ${email}`);
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      console.log(`User found: ${email}`);

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log(`Password does not match for user: ${email}`);
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      console.log(`Password matches for user: ${email}`);

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(`Server Error: ${err.message}`);
      res.status(500).send("Server Error");
    }
  },

  // Get user profile
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        console.log(`User not found: ${req.user.id}`);
        return res.status(404).json({ msg: "User not found" });
      }

      res.json(user);
    } catch (err) {
      console.error(`Server Error: ${err.message}`);
      res.status(500).send("Server Error");
    }
  },
};

module.exports = authController;
