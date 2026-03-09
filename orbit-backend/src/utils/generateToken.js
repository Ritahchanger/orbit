const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = ({ user, permissions }) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      firstName: user.firstName,
      permissions,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }, // Changed from 15m to 1h
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
      type: "refresh",
    },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    );
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, generateRefreshToken, verifyRefreshToken };
