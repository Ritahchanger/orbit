// middlewares/tokenValidator.js
const jwt = require("jsonwebtoken");
const { findUserById } = require("../user");
const { checkBusinessAccess } = require("../business");
const brand = require("../config/brand");
require("dotenv").config();

const tokenValidator = async (req, res, next) => {
  try {
    // Support both Bearer token in header and cookie
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No access token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id)
      .select("-password")
      .populate("assignedStore", "name code address")
      .populate("storePermissions.store", "name code");

    if (!user || user.isSuspended) {
      return res
        .status(401)
        .json({ success: false, message: "User not found or suspended" });
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
        supportEmail: brand.supportEmail,
      });
    }

    req.user = user;
    req.businessId = user.businessId;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Access token expired" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid access token" });
  }
};

module.exports = tokenValidator;
