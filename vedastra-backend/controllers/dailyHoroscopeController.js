const DailyHoroscope = require("../models/DailyHoroscope");

// Create a daily horoscope
exports.createDailyHoroscope = async (req, res) => {
  const { date, sign, content } = req.body;

  try {
    const newHoroscope = new DailyHoroscope({
      date,
      sign,
      content,
    });

    const horoscope = await newHoroscope.save();
    res.json(horoscope);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get daily horoscopes
exports.getDailyHoroscopes = async (req, res) => {
  try {
    const horoscopes = await DailyHoroscope.find();
    res.json(horoscopes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
