const Astrologer = require("../models/Astrologer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Astrologer registration
exports.registerAstrologer = async (req, res) => {
  const { name, email, password, specializations, availability } = req.body;

  if (!name || !email || !password || !specializations || !availability) {
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
      availability,
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

// Update astrologer availability
exports.updateAstrologerAvailability = async (req, res) => {
  const { days, timeSlots } = req.body;

  try {
    if (!req.astrologer || !req.astrologer.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const astrologer = await Astrologer.findById(req.astrologer.id);

    if (!astrologer) {
      return res.status(404).json({ msg: "Astrologer not found" });
    }

    if (!Array.isArray(days) || !Array.isArray(timeSlots)) {
      return res.status(400).json({ msg: "Days and timeSlots must be arrays" });
    }

    if (days.length === 0 || timeSlots.length === 0) {
      return res
        .status(400)
        .json({ msg: "Days and timeSlots cannot be empty" });
    }

    astrologer.availability = {
      days: days,
      timeSlots: timeSlots,
    };

    await astrologer.save();

    res.json({ msg: "Availability updated successfully", astrologer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
