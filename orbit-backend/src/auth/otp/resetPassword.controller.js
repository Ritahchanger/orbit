const ResetPasswordService = require("./resetPassword.service");
const OTPService = require("../otp/otp.service");

class ResetPasswordController {
  async resetPassword(req, res) {
    try {
      const { email, newPassword, otp } = req.body;

      console.log(req.body)

      if (!email || !newPassword || !otp) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      const result = await ResetPasswordService.resetPassword(
        email,
        newPassword,
        otp,
        OTPService,
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Reset Password Error:", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ResetPasswordController();
