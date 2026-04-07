// middlewares/refreshTokenValidator.js
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");
const RefreshToken = require("../auth/models/refreshTokenSchema");
require("dotenv").config();
const protect = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    req.businessId = decoded.businessId; // 🔥 from token
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
