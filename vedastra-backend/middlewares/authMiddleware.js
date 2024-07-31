const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // If no token is provided, respond with unauthorized status
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token contains 'user' or 'astrologer' and attach to request
    if (decoded.user) {
      req.user = decoded.user;
    } else if (decoded.astrologer) {
      req.astrologer = decoded.astrologer;
    } else {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle any errors during token verification
    console.error("Token verification error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;
