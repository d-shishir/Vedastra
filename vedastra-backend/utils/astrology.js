// utils/astrology.js
const moment = require("moment");

const calculateJulianDate = (date, time) => {
  const year = moment(date).year();
  const dayOfYear = moment(date).dayOfYear();
  const ut = moment(time, "HH:mm").hour() + moment(time, "HH:mm").minute() / 60;
  const jd2000 = 2451545.0;
  return jd2000 + (year - 2000) * 365.25 + dayOfYear + ut / 24;
};

const calculatePlanetaryPositions = (jd) => {
  const planets = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
  ];
  const positions = {};

  planets.forEach((planet) => {
    const meanLongitude = Math.random() * 360; // Placeholder
    const anomaly = Math.random() * 10; // Placeholder
    const equationOfCenter = Math.random(); // Placeholder
    positions[planet] = meanLongitude + anomaly + equationOfCenter;
  });

  return positions;
};

const calculateHouses = (jd, location) => {
  return {
    Ascendant: Math.random() * 360,
    MC: Math.random() * 360,
  };
};

const calculateCurrentTransits = () => {
  const planets = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
  ];
  const transits = {};

  planets.forEach((planet) => {
    const meanLongitude = Math.random() * 360; // Placeholder
    const anomaly = Math.random() * 10; // Placeholder
    const equationOfCenter = Math.random(); // Placeholder
    transits[planet] = meanLongitude + anomaly + equationOfCenter;
  });

  return transits;
};

const patternMatching = (natalChart, transits) => {
  const similarityScore = (aspectAngle, refAspectAngle) => {
    return 1 / (1 + Math.exp(-Math.abs(aspectAngle - refAspectAngle)));
  };

  const patterns = {
    conjunction: 0,
    opposition: 180,
    square: 90,
    trine: 120,
    sextile: 60,
  };

  let score = 0;
  for (const planet in transits) {
    const natalPosition = natalChart[planet];
    const transitPosition = transits[planet];
    const aspectAngle = Math.abs(transitPosition - natalPosition);

    for (const pattern in patterns) {
      score += similarityScore(aspectAngle, patterns[pattern]);
    }
  }

  return score;
};

module.exports = {
  calculateJulianDate,
  calculatePlanetaryPositions,
  calculateHouses,
  calculateCurrentTransits,
  patternMatching,
};
