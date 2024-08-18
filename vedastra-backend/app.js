const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");
const path = require("path"); // Add path for serving HTML files
require("dotenv").config();

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/astrologers", require("./routes/astrologerRoutes"));
app.use("/api/consultations", require("./routes/consultationRoutes"));
app.use("/api/dailyHoroscopes", require("./routes/dailyHoroscopeRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Serve the admin login page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-login.html"));
});

// Serve the admin dashboard page (after successful login)
app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
