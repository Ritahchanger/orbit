const Router = require("express").Router();
const asyncWrapper = require("../../middlewares/asyncMiddleware");
const OTPController = require("./otp.controller");
const ResetPasswordController = require("./resetPassword.controller");

// Apply asyncWrapper to each controller method
Router.post(
  "/send-verification",
  asyncWrapper(OTPController.sendVerificationOTP),
);
Router.post(
  "/verify-registration",
  asyncWrapper(OTPController.verifyRegistrationOTP),
);
Router.post(
  "/send-password-reset",
  asyncWrapper(OTPController.sendPasswordResetOTP),
);
Router.post(
  "/verify-password-reset",
  asyncWrapper(OTPController.verifyPasswordResetOTP),
);
Router.post("/resend", asyncWrapper(OTPController.resendOTP));

Router.get("/status", asyncWrapper(OTPController.checkOTPStatus));

Router.post("/reset-password", ResetPasswordController.resetPassword);

Router.post(
  "/validate-reset-token",
  asyncWrapper(OTPController.validateResetToken),
);

Router.post("/send-login", asyncWrapper(OTPController.sendLoginOTP));

Router.post("/verify-login", asyncWrapper(OTPController.verifyLoginOTP));

module.exports = Router;
