const mongoose = require("mongoose");
const Admin = require("./models/Admin"); // Adjust path as necessary
const bcrypt = require("bcrypt");
require("dotenv").config();

// Connect to the database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to the database");

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("test123", 10);
    console.log("Hashed Password:", hashedPassword); // Log hashed password

    // Create a new admin
    const newAdmin = new Admin({
      username: "admin",
      password: hashedPassword,
    });

    await newAdmin.save();
    console.log("Admin created successfully");

    // Disconnect from the database
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });
