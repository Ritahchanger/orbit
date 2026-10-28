// middlewares/platform-auth.middleware.js
// Authenticates Orbit's own staff for the platform dashboard. Platform admins
// use their own cookie (platformToken, scoped to /api/v1/platform) and their
// own login; business routes reject them, and these routes reject business
// users, so the two kinds of session never mix.
const jwt = require("jsonwebtoken");
const { findUserById } = require("../../user");
require("dotenv").config();

const PLATFORM_COOKIE = "platformToken";
const PLATFORM_SCOPE = "platform";

const deny = (res, message) =>
  res.status(401).json({ success: false, message });

const platformAuth = async (req, res, next) => {
  const token = req.cookies?.[PLATFORM_COOKIE];
  if (!token) return deny(res, "Platform login required");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return deny(
      res,
      error.name === "TokenExpiredError"
        ? "Platform session expired"
        : "Invalid platform session",
    );
  }

  if (decoded.scope !== PLATFORM_SCOPE) {
    return deny(res, "Invalid platform session");
  }

  // Re-checked on every request so removing or suspending an admin takes
  // effect immediately rather than when the token expires.
  const admin = await findUserById(decoded.id).select("-password").lean();
  if (
    !admin ||
    admin.role !== "platform_admin" ||
    admin.isSuspended ||
    admin.isActive === false
  ) {
    return deny(res, "Platform access revoked");
  }

  req.platformAdmin = admin;
  next();
};

module.exports = { platformAuth, PLATFORM_COOKIE, PLATFORM_SCOPE };
