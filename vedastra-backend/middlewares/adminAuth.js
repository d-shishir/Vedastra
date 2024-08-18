const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Failed to authenticate token" });

    req.userId = decoded.id;
    next();
  });
};

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.userId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking admin status", error });
  }
};

module.exports = { verifyToken, isAdmin };
