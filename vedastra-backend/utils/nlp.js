// utils/nlp.js
const tf = require("@tensorflow/tfjs");
const use = require("@tensorflow-models/universal-sentence-encoder");

let model;
use.load().then((loadedModel) => {
  model = loadedModel;
});

const generateHoroscopeText = async (astrologicalData) => {
  const sentences = [
    "Today you might feel a strong sense of purpose.",
    "An unexpected opportunity may present itself.",
    "Focus on your personal growth and relationships.",
  ];

  const embeddings = await model.embed(sentences);
  return sentences[Math.floor(Math.random() * sentences.length)];
};

module.exports = {
  generateHoroscopeText,
};
