const Astrologer = require("../models/Astrologer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Astrologer registration
exports.registerAstrologer = async (req, res) => {
  const { name, email, password, specializations, availability } = req.body;

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
