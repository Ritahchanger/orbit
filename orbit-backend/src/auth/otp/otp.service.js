const { transporter } = require("../../utils/transporter");
const crypto = require("crypto");
const { RedisClient } = require("../../config/redis");

const { getEmailTemplate } = require("./getEmail");

require("dotenv").config();

class OTPService {
    constructor() {
        // Use the existing transporter instead of creating a new one
        this.transporter = transporter;

        // OTP configuration
        this.OTP_EXPIRY = 10 * 60; // 10 minutes in seconds
        this.MAX_ATTEMPTS = 3; // Maximum OTP verification attempts
        this.RESEND_COOLDOWN = 60; // 60 seconds cooldown between resends
    }

    /**
     * Generate a 6-digit OTP
     */
    generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * Store OTP in Redis with expiry
     */
    async storeOTP(email, otp, purpose = "verification") {
        const key = `otp:${purpose}:${email}`;
        const attemptsKey = `otp_attempts:${purpose}:${email}`;
        const cooldownKey = `otp_cooldown:${purpose}:${email}`;

        // Store OTP with expiry
        await RedisClient.setEx(key, this.OTP_EXPIRY, otp);

        // Initialize attempts counter
        await RedisClient.setEx(attemptsKey, this.OTP_EXPIRY, "0");

        // Set cooldown
        await RedisClient.setEx(cooldownKey, this.RESEND_COOLDOWN, "cooldown");

        return true;
    }

    /**
     * Verify OTP
     */
    async verifyOTP(email, otp, purpose = "verification") {
        const key = `otp:${purpose}:${email}`;
        const attemptsKey = `otp_attempts:${purpose}:${email}`;

        console.log(email, otp)

        // Get stored OTP
        const storedOTP = await RedisClient.get(key);

        console.log(storedOTP)

        if (!storedOTP) {
            throw new Error("OTP expired or not found");
        }

        // Check attempts
        const attempts = parseInt(await RedisClient.get(attemptsKey) || "0");

        if (attempts >= this.MAX_ATTEMPTS) {
            // Delete OTP if max attempts reached
            await RedisClient.del(key);
            await RedisClient.del(attemptsKey);
            throw new Error("Maximum verification attempts reached. Please request a new OTP.");
        }

        // Increment attempts
        await RedisClient.incr(attemptsKey);

        if (storedOTP !== otp) {
            throw new Error("Invalid OTP");
        }

        // OTP verified successfully
        // Clean up OTP data
        await RedisClient.del(key);
        await RedisClient.del(attemptsKey);

        return true;
    }

    /**
     * Send OTP email
     */
    async sendOTPEmail(email, otp, purpose = "verification") {
        const subjectMap = {
            verification: "Verify Your Email - Mega Gamers",
            password_reset: "Password Reset OTP - Mega Gamers",
            login: "Login OTP - Mega Gamers",
            account_creation: "Account Created - Mega Gamers"
        };

        const subject = subjectMap[purpose] || "Your OTP - Mega Gamers";

        // Get email templates based on purpose
        const emailHtml = getEmailTemplate(purpose, { otp });

        const mailOptions = {
            from: {
                name: process.env.COMPANY_NAME || "Mega Gamers",
                address: process.env.COMPANY_EMAIL || process.env.GMAIL_USER,
            },
            to: email,
            subject: subject,
            html: emailHtml,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`📧 OTP email sent to ${email}: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error("❌ Error sending OTP email:", error);
            throw new Error(`Failed to send OTP email: ${error.message}`);
        }
    }

    // Add this new method to your OTPService
    async verifyLoginOTPAndGenerateToken(email, otp) {

        const otpResult = await this.verifyOTPWithoutDeletion(email, otp, "login");

        if (!otpResult.success) {
            throw new Error("OTP verification failed");
        }

        // Step 2: Find user
        const User = require('../../user/user.model');
        const jwt = require('jsonwebtoken');

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }

        // Step 3: Generate token (same as your normal signin)
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Step 4: Return formatted response
        return {
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        };
    }

    async verifyOTPWithoutDeletion(email, otp, purpose = "login") {
        const key = `otp:${purpose}:${email}`;
        const attemptsKey = `otp_attempts:${purpose}:${email}`;

        // Debug logs
        console.log(`[OTP Service] Verifying OTP for ${email}, purpose: ${purpose}`);
        console.log(`[OTP Service] Redis key: ${key}`);

        // Get stored OTP
        const storedOTP = await RedisClient.get(key);
        console.log(`[OTP Service] Stored OTP: ${storedOTP ? 'Found' : 'Not found'}`);

        if (!storedOTP) {
            // Optional: Log all OTP keys for debugging
            const allKeys = await RedisClient.keys('otp:*');
            console.log(`[OTP Service] All OTP keys: ${allKeys.length > 0 ? allKeys.join(', ') : 'None'}`);
            throw new Error("OTP expired or not found");
        }

        // Check attempts
        const attempts = parseInt(await RedisClient.get(attemptsKey) || "0");
        console.log(`[OTP Service] Attempts: ${attempts}/${this.MAX_ATTEMPTS}`);

        if (attempts >= this.MAX_ATTEMPTS) {
            // Delete OTP if max attempts reached
            await RedisClient.del(key);
            await RedisClient.del(attemptsKey);
            throw new Error("Maximum verification attempts reached. Please request a new OTP.");
        }

        // Increment attempts
        await RedisClient.incr(attemptsKey);

        if (storedOTP !== otp) {
            throw new Error("Invalid OTP");
        }

        // OTP verified successfully but DON'T delete it
        // Just clean up attempts and set shorter expiry
        await RedisClient.del(attemptsKey);

        // Set shorter expiry (30 seconds) for cleanup
        await RedisClient.expire(key, 30);

        console.log(`[OTP Service] OTP verified successfully for ${email}`);

        // Return simple success - This is what verifyLoginOTPAndGenerateToken expects
        return {
            success: true,
            email,
            purpose
        };
    }

  

    /**
     * Check if can resend OTP (cooldown check)
     */
    async canResendOTP(email, purpose = "verification") {
        const cooldownKey = `otp_cooldown:${purpose}:${email}`;
        const cooldown = await RedisClient.get(cooldownKey);

        return !cooldown; // Returns true if no cooldown
    }

    /**
     * Send and store OTP
     */
    async sendAndStoreOTP(email, purpose = "verification") {
        // Check cooldown
        if (!(await this.canResendOTP(email, purpose))) {
            throw new Error("Please wait before requesting a new OTP");
        }

        // Generate OTP
        const otp = this.generateOTP();

        // Store OTP
        await this.storeOTP(email, otp, purpose);

        // Send email
        await this.sendOTPEmail(email, otp, purpose);

        return { success: true, message: "OTP sent successfully" };
    }

    /**
     * Get OTP expiry time remaining
     */
    async getOTPExpiry(email, purpose = "verification") {
        const key = `otp:${purpose}:${email}`;
        const ttl = await RedisClient.ttl(key);
        return ttl > 0 ? ttl : 0;
    }

    /**
     * Clean up OTP data for an email
     */
    async cleanupOTP(email, purpose = "verification") {
        const keys = [
            `otp:${purpose}:${email}`,
            `otp_attempts:${purpose}:${email}`,
            `otp_cooldown:${purpose}:${email}`
        ];

        for (const key of keys) {
            await RedisClient.del(key);
        }

        return true;
    }

    /**
     * Check if OTP exists and is valid
     */
    async checkOTPExists(email, purpose = "verification") {
        const key = `otp:${purpose}:${email}`;
        const otp = await RedisClient.get(key);
        const ttl = await RedisClient.ttl(key);

        return {
            exists: !!otp,
            expiresIn: ttl > 0 ? ttl : 0
        };
    }
}

module.exports = new OTPService();