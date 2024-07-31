const User = require("../models/User"); // Adjust path if needed

// Function to determine Zodiac Sign
const getZodiacSign = (birthdate) => {
  try {
    const date = new Date(birthdate);
    const month = date.getUTCMonth() + 1; // Months are 0-indexed, so add 1
    const day = date.getUTCDate();

    const zodiacSigns = [
      { sign: "capricorn", endDate: new Date(date.getFullYear(), 0, 19) },
      { sign: "aquarius", endDate: new Date(date.getFullYear(), 1, 18) },
      { sign: "pisces", endDate: new Date(date.getFullYear(), 2, 20) },
      { sign: "aries", endDate: new Date(date.getFullYear(), 3, 19) },
      { sign: "taurus", endDate: new Date(date.getFullYear(), 4, 20) },
      { sign: "gemini", endDate: new Date(date.getFullYear(), 5, 20) },
      { sign: "cancer", endDate: new Date(date.getFullYear(), 6, 22) },
      { sign: "leo", endDate: new Date(date.getFullYear(), 7, 22) },
      { sign: "virgo", endDate: new Date(date.getFullYear(), 8, 22) },
      { sign: "libra", endDate: new Date(date.getFullYear(), 9, 22) },
      { sign: "scorpio", endDate: new Date(date.getFullYear(), 10, 21) },
      { sign: "sagittarius", endDate: new Date(date.getFullYear(), 11, 21) },
    ];

    for (let i = 0; i < zodiacSigns.length; i++) {
      const startDate = new Date(
        date.getFullYear(),
        i === 0 ? 11 : i - 1,
        zodiacSigns[i - 1]?.endDate.getDate() + 1 || 22
      );
      if (
        (month === startDate.getMonth() + 1 && day >= startDate.getDate()) ||
        (month === zodiacSigns[i].endDate.getMonth() + 1 &&
          day <= zodiacSigns[i].endDate.getDate())
      ) {
        return zodiacSigns[i].sign;
      }
    }

    // Capricorn (end of year case)
    return "capricorn";
  } catch (error) {
    console.error("Error determining Zodiac sign:", error);
    return null;
  }
};

// Controller method to get zodiac sign for authenticated user
module.exports = {
  getZodiacSignForUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        console.log(`User not found: ${req.user.id}`);
        return res.status(404).json({ msg: "User not found" });
      }

      // Determine Zodiac Sign
      const zodiacSign = getZodiacSign(user.birthdate);

      // Include Zodiac Sign in the response
      res.json({ zodiacSign });
    } catch (err) {
      console.error(`Server Error: ${err.message}`);
      res.status(500).send("Server Error");
    }
  },
};
