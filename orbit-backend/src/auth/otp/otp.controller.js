const OTPService = require("./otp.service");


const User = require("../../user/user.model");


const crypto = require("crypto");


const { RedisClient } = require("../../config/redis");

class OTPController {
    /**
     * Send verification OTP for new user registration
     */
    sendVerificationOTP = async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Send OTP
        const result = await OTPService.sendAndStoreOTP(email, "verification");

        res.status(200).json({
            success: true,
            message: "Verification OTP sent successfully",
            data: {
                email,
                expiresIn: OTPService.OTP_EXPIRY,
            },
        });
    };

    /**
     * Verify OTP during registration
     */
    verifyRegistrationOTP = async (req, res) => {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        // Verify OTP
        await OTPService.verifyOTP(email, otp, "verification");

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            data: {
                email,
                verified: true,
            },
        });
    };

    /**
     * Send password reset OTP
     */
    sendPasswordResetOTP = async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // For security, return success even if user doesn't exist
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, an OTP has been sent",
            });
        }

        // Send OTP
        const result = await OTPService.sendAndStoreOTP(email, "password_reset");

        res.status(200).json({
            success: true,
            message: "Password reset OTP sent successfully",
            data: {
                email,
                expiresIn: OTPService.OTP_EXPIRY,
            },
        });
    };

    /**
     * Verify password reset OTPa
     */
    // In OTPController.js, update verifyPasswordResetOTP:
    verifyPasswordResetOTP = async (req, res) => {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        // Use verifyOTPWithoutDeletion instead
        const otpResult = await OTPService.verifyOTPWithoutDeletion(email, otp, "password_reset");

        if (!otpResult.success) {
            return res.status(400).json({
                success: false,
                message: otpResult.message || "OTP verification failed",
            });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store reset token in Redis with expiry
        const redisKey = `reset_token:${email}`;
        await RedisClient.setEx(redisKey, 15 * 60, resetToken);

        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            data: {
                email,
                resetToken,
                tokenExpiry: 15 * 60,
            },
        });
    };

    /**
     * Resend OTP
     */
    resendOTP = async (req, res) => {
        const { email, purpose = "verification" } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const result = await OTPService.sendAndStoreOTP(email, purpose);

        res.status(200).json({
            success: true,
            message: "OTP resent successfully",
            data: {
                email,
                purpose,
                expiresIn: OTPService.OTP_EXPIRY,
            },
        });
    };

    /**
     * Check OTP status
     */
    checkOTPStatus = async (req, res) => {
        const { email, purpose = "verification" } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const expiry = await OTPService.getOTPExpiry(email, purpose);
        const canResend = await OTPService.canResendOTP(email, purpose);

        res.status(200).json({
            success: true,
            data: {
                email,
                purpose,
                expiresIn: expiry,
                canResend,
                hasOTP: expiry > 0,
            },
        });
    };

    /**
     * Validate reset token (for use after OTP verification)
     */
    validateResetToken = async (req, res) => {
        const { email, resetToken } = req.body;

        if (!email || !resetToken) {
            return res.status(400).json({
                success: false,
                message: "Email and reset token are required",
            });
        }

        const redisKey = `reset_token:${email}`;
        const storedToken = await RedisClient.get(redisKey);

        if (!storedToken || storedToken !== resetToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        res.status(200).json({
            success: true,
            message: "Reset token is valid",
            data: {
                email,
                valid: true,
            },
        });
    };

    /**
     * Send login OTP (for 2-factor authentication)
     */
    sendLoginOTP = async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Send OTP
        const result = await OTPService.sendAndStoreOTP(email, "login");

        res.status(200).json({
            success: true,
            message: "Login OTP sent successfully",
            data: {
                email,
                expiresIn: OTPService.OTP_EXPIRY,
            },
        });
    };

    /**
     * Verify login OTP
     */
    verifyLoginOTP = async (req, res) => {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        // Use the new service method that includes token generation
        const result = await OTPService.verifyLoginOTPAndGenerateToken(email, otp);
        // Set cookie (same as your normal signin)
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            role: result.user.role,  // Role comes from service
            token: result.token,
            user: result.user
        });
    };
}

module.exports = new OTPController();