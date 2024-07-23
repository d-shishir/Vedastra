// index.js
const {
  calculateJulianDate,
  calculatePlanetaryPositions,
  calculateHouses,
  calculateCurrentTransits,
  patternMatching,
} = require("./astrology");
const { generateHoroscopeText } = require("./nlp");

const main = async (userData) => {
  const { birthDate, birthTime, birthLocation } = userData;
  const { latitude, longitude } = birthLocation;

  // Calculate Julian Date for birth date
  const jd = calculateJulianDate(birthDate, birthTime);

  // Calculate natal chart (birth chart)
  const natalChart = calculatePlanetaryPositions(jd);

  // Calculate house cusps
  const houses = calculateHouses(jd, latitude, longitude);

  // Calculate current planetary positions (transits)
  const currentTransits = calculateCurrentTransits();

  // Historical data for pattern matching (sample data)
  const historicalData = {
    events: [
      {
        date: "2023-07-15",
        planetaryPositions: {
          Sun: 120,
          Moon: 300,
          Mercury: 60,
          Venus: 45,
          Mars: 90,
          Jupiter: 180,
          Saturn: 270,
        },
      },
      {
        date: "2023-08-01",
        planetaryPositions: {
          Sun: 150,
          Moon: 330,
          Mercury: 90,
          Venus: 75,
          Mars: 120,
          Jupiter: 210,
          Saturn: 300,
        },
      },
    ],
  };

  // Generate predictions
  const similarityScore = patternMatching(
    natalChart,
    currentTransits,
    historicalData
  );
  let predictions;
  if (similarityScore > 0.8) {
    predictions =
      "Significant events predicted based on high similarity score.";
  } else {
    predictions = "No significant predictions for today.";
  }

  // Generate horoscope text
  const horoscopeText = await generateHoroscopeText(predictions);

  return horoscopeText;
};

// Example usage
const userData = {
  birthDate: "1990-05-15",
  birthTime: "14:30",
  birthLocation: { latitude: 40.7128, longitude: -74.006 }, // New York, USA
};

main(userData)
  .then((horoscope) => console.log(horoscope))
  .catch((err) => console.error(err));
