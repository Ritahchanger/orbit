// controllers/platform-auth.controller.js
const platformAuthService = require("../services/platform-auth.service");
const { PLATFORM_COOKIE } = require("../middlewares/platform-auth.middleware");
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
    if (error.statusCode === 401) req.recordLoginFailure();
    throw error;
  }

  req.clearLoginFailures();
  log.info(`Platform admin signed in: ${result.admin.email}`);

  res.cookie(PLATFORM_COOKIE, result.token, { ...cookieOptions, maxAge: result.maxAge });
  res.status(200).json({ success: true, data: { admin: result.admin } });
};

const logout = (req, res) => {
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
