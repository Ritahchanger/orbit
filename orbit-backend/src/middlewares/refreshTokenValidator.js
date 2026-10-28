// middlewares/refreshTokenValidator.js
const jwt = require("jsonwebtoken");
const RefreshToken = require("../auth/models/refresh-token.model"); // Create this model
const { findUserById } = require("../user");
const { checkBusinessAccess } = require("../business");
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

    const user = await findUserById(decoded.id)
      .select("-password")
      .populate("assignedStore", "name code address")
      .populate("storePermissions.store", "name code");

    if (!user || user.isSuspended) {
      return res.status(401).json({
        success: false,
        message: "User not found or suspended",
      });
    }

    // Platform admins sign in to the platform dashboard only (/api/v1/platform);
    // they belong to no business, so business routes must never run for them.
    if (user.role === "platform_admin") {
      return res.status(403).json({
        success: false,
        message: "Platform accounts can't use business routes",
      });
    }

    // Users of a suspended or cancelled business are locked out
    const blocked = await checkBusinessAccess(user.businessId);
    if (blocked) {
      return res.status(403).json({
        success: false,
        code: "BUSINESS_BLOCKED",
        businessStatus: blocked.status,
        message: blocked.message,
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
