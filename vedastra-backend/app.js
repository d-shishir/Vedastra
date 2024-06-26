const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
require("dotenv").config();

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/astrologers", require("./routes/astrologerRoutes"));
app.use("/api/consultations", require("./routes/consultationRoutes"));
app.use("/api/dailyHoroscopes", require("./routes/dailyHoroscopeRoutes"));

// Error handling middleware
app.use(errorHandler);

module.exports = app;
