// middlewares/refreshTokenValidator.js
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");
const RefreshToken = require("../auth/models/refreshTokenSchema"); // Create this model
require("dotenv").config();

const refreshTokenValidator = async (req, res, next) => {
  // Get refresh token from cookie (sent only to /refresh endpoint)
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided",
      redirect: `${process.env.FRONTEND_URL}/admin/auth/login`,
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    );

    // Check if token exists in database and not revoked
    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      revoked: false,
      userId: decoded.id,
    });

    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        message: "Refresh token revoked or not found",
        redirect: `${process.env.FRONTEND_URL}/admin/auth/login`,
      });
    }

    // Fetch user
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("assignedStore", "name code address")
      .populate("storePermissions.store", "name code");

    if (!user || user.isSuspended) {
      return res.status(401).json({
        success: false,
        message: "User not found or suspended",
        redirect: `${process.env.FRONTEND_URL}/admin/auth/login`,
      });
    }

    // Attach to request
    req.user = user;
    req.refreshTokenDoc = tokenDoc;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
        redirect: `${process.env.FRONTEND_URL}/admin/auth/login`,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
      redirect: `${process.env.FRONTEND_URL}/admin/auth/login`,
    });
  }
};

module.exports = refreshTokenValidator;
