// controllers/platform-auth.controller.js
const jwt = require("jsonwebtoken");
const platformAuthService = require("../services/platform-auth.service");
const activityService = require("../services/platform-activity.service");
const { PLATFORM_COOKIE } = require("../middlewares/platform-auth.middleware");
const { findUserById } = require("../../user");
const log = require("../../utils/log");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  path: "/api/v1/platform",
};

const login = async (req, res) => {
  let result;
  try {
    result = await platformAuthService.login(req.body?.email, req.body?.password);
  } catch (error) {
    if (error.statusCode === 401) {
      req.recordLoginFailure();
      // Only the email that was tried; never the password
      await activityService.record(req, {
        action: "auth.login_failed",
        actor: { email: String(req.body?.email || "").toLowerCase().trim().slice(0, 254) },
      });
    }
    throw error;
  }

  req.clearLoginFailures();
  await activityService.record(req, { action: "auth.login", admin: result.admin });
  log.info(`Platform admin signed in: ${result.admin.email}`);

  res.cookie(PLATFORM_COOKIE, result.token, { ...cookieOptions, maxAge: result.maxAge });
  res.status(200).json({ success: true, data: { admin: result.admin } });
};

// Signing out works even with an expired session; it's logged when the
// session still identifies an admin
const logout = async (req, res) => {
  try {
    const { id } = jwt.verify(req.cookies?.[PLATFORM_COOKIE] || "", process.env.JWT_SECRET);
    const admin = await findUserById(id).select("firstName lastName email role").lean();
    if (admin?.role === "platform_admin") {
      await activityService.record(req, { action: "auth.logout", admin });
    }
  } catch {
    // No valid session to attribute the sign-out to
  }

  res.clearCookie(PLATFORM_COOKIE, cookieOptions);
  res.status(200).json({ success: true, message: "Signed out" });
};

const me = (req, res) => {
  res.status(200).json({
    success: true,
    data: { admin: platformAuthService.toPublicAdmin(req.platformAdmin) },
  });
};

module.exports = { login, logout, me };
