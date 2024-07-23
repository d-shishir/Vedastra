// utils/astrology.js
const moment = require("moment");
const swe = require("sweph");

const calculateJulianDate = (date, time) => {
  const year = moment(date).year();
  const month = moment(date).month() + 1; // Months are 0-indexed in moment.js
  const day = moment(date).date();
  const hour = moment(time, "HH:mm").hour();
  const minute = moment(time, "HH:mm").minute();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  const jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  const jdFrac = (hour - 12) / 24 + minute / 1440;
  return jd + jdFrac;
};

const calculatePlanetaryPositions = (jd) => {
  const planets = [
    swe.SE_SUN,
    swe.SE_MOON,
    swe.SE_MERCURY,
    swe.SE_VENUS,
    swe.SE_MARS,
    swe.SE_JUPITER,
    swe.SE_SATURN,
    swe.SE_URANUS,
    swe.SE_NEPTUNE,
    swe.SE_PLUTO,
  ];
  const planetNames = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];
  const positions = {};

  planets.forEach((planet, index) => {
    const result = swe.calc_ut(jd, planet, swe.SEFLG_SWIEPH);
    if (result.rc === swe.OK) {
      positions[planetNames[index]] = result.longitude;
    } else {
      console.error(`Error calculating position for ${planetNames[index]}`);
    }
  });

  return positions;
};

const calculateHouses = (jd, latitude, longitude) => {
  const flags = swe.SEFLG_SWIEPH;
  const hsys = "P"; // 'P' for Placidus
  const cuspArray = new Array(13).fill(0); // Array to hold house cusps
  const ascmc = new Array(10).fill(0); // Array to hold ASC, MC, etc.

  swe.swe_houses(jd, flags, latitude, longitude, hsys, cuspArray, ascmc);

  return {
    Ascendant: ascmc[0], // Ascendant is the first value in ascmc array
    MC: ascmc[1], // Midheaven (MC) is the second value in ascmc array
  };
};

const calculateCurrentTransits = () => {
  const jd = swe.julday(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth() + 1,
    new Date().getUTCDate(),
    new Date().getUTCHours() + new Date().getUTCMinutes() / 60
  );

  const planets = [
    swe.SE_SUN,
    swe.SE_MOON,
    swe.SE_MERCURY,
    swe.SE_VENUS,
    swe.SE_MARS,
    swe.SE_JUPITER,
    swe.SE_SATURN,
    swe.SE_URANUS,
    swe.SE_NEPTUNE,
    swe.SE_PLUTO,
  ];
  const planetNames = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];
  const transits = {};

  planets.forEach((planet, index) => {
    const result = swe.calc_ut(jd, planet, swe.SEFLG_SWIEPH);
    if (result.rc === swe.OK) {
      transits[planetNames[index]] = {
        longitude: result.longitude,
        latitude: result.latitude,
        distance: result.distance,
        speedLongitude: result.speedLongitude,
        speedLatitude: result.speedLatitude,
        speedDistance: result.speedDistance,
      };
    } else {
      console.error(
        `Error calculating current transit for ${planetNames[index]}`
      );
    }
  });

  return transits;
};

const patternMatching = (natalChart, transits, historicalData) => {
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
    const transitPosition = transits[planet].longitude;
    const aspectAngle = Math.abs(transitPosition - natalPosition);

    for (const pattern in patterns) {
      score += similarityScore(aspectAngle, patterns[pattern]);
    }
  }

  return score / Object.keys(transits).length;
};

module.exports = {
  calculateJulianDate,
  calculatePlanetaryPositions,
  calculateHouses,
  calculateCurrentTransits,
  patternMatching,
};
