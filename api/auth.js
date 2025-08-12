// middleware/auth.js
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.cookies?.token; // JWT stored in cookie

  if (!token) {
    return res.status(401).json({ message: "Access denied. Please log in." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // store decoded user data in req.user
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = authenticateToken;
