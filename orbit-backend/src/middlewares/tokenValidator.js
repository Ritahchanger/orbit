// middlewares/tokenValidator.js
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");
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
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("assignedStore", "name code address")
      .populate("storePermissions.store", "name code");

    if (!user || user.isSuspended) {
      return res
        .status(401)
        .json({ success: false, message: "User not found or suspended" });
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
