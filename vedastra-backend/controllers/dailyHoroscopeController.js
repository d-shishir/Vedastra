const User = require("../models/User");
const Horoscope = require("../models/Horoscope");
const {
  calculateJulianDate,
  calculatePlanetaryPositions,
  calculateHouses,
  calculateCurrentTransits,
  patternMatching,
} = require("../utils/astrology");
const { generateHoroscopeText } = require("../utils/nlp");

exports.createDailyHoroscope = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const jd = calculateJulianDate(user.birthdate, user.birthTime);
    const natalChart = calculatePlanetaryPositions(jd);
    const houses = calculateHouses(jd, user.latitude, user.longitude);

    const currentTransits = calculateCurrentTransits();
    const score = patternMatching(natalChart, currentTransits);

    const astrologicalData = { natalChart, houses, currentTransits, score };
    const horoscopeText = await generateHoroscopeText(astrologicalData);

    const horoscope = new Horoscope({ userId: user._id, horoscopeText });
    await horoscope.save();

    res.json({ horoscopeText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getDailyHoroscopes = async (req, res) => {
  try {
    const horoscopes = await Horoscope.find().populate("userId");
    res.json(horoscopes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
