const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded Token Payload:", decoded);

    if (decoded.user) {
      req.user = decoded.user;
    } else if (decoded.astrologer) {
      req.astrologer = decoded.astrologer;
    } else {
      console.error("Invalid token payload:", decoded);
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    next();
  } catch (err) {
    console.error("Token verification error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Token is not valid" });
    } else {
      return res.status(500).json({ msg: "Internal server error" });
    }
  }
};

module.exports = authMiddleware;
