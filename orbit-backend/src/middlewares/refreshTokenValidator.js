// middlewares/refreshTokenValidator.js
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");
const RefreshToken = require("../auth/models/refreshTokenSchema"); // Create this model
require("dotenv").config();

const refreshTokenValidator = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    );

    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      revoked: false,
      userId: decoded.id,
    });

    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        message: "Refresh token revoked or not found",
      });
    }

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("assignedStore", "name code address")
      .populate("storePermissions.store", "name code");

    if (!user || user.isSuspended) {
      return res.status(401).json({
        success: false,
        message: "User not found or suspended",
      });
    }

    // ✅ Attach both
    req.user = user;
    req.businessId = user.businessId; // 🔥 CRITICAL
    req.refreshTokenDoc = tokenDoc;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

module.exports = refreshTokenValidator;
