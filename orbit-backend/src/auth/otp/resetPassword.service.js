const bcrypt = require("bcrypt");
const User = require("../../user/user.model");
const otpService = require("./otp.service");

class ResetPasswordService {
  constructor() {
    this.SALT_ROUNDS = 10;
  }

  async resetPassword(email, newPassword, otp) {
    // 1️⃣ Verify OTP
    await otpService.verifyOTP(email, otp, "password_reset");

    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // 4️⃣ Update password
    user.password = hashedPassword;
    await user.save();

    // 5️⃣ Cleanup OTP
    await otpService.cleanupOTP(email, "password_reset");

    return { success: true, message: "Password reset successfully" };
  }
}

module.exports = new ResetPasswordService();
