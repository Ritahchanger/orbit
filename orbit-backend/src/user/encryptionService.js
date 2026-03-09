const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class EncryptionService {
  constructor() {
    this.saltRounds = 12;
  }

  // Password encryption
  async hashPassword(password) {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error("Password encryption failed");
    }
  }

  // Password verification
  async comparePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error("Password comparison failed");
    }
  }

  // Generate verification token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  // Generate reset token
  generateResetToken() {
    return {
      token: crypto.randomBytes(32).toString("hex"),
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    };
  }

  // Verify token expiration
  isTokenExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  }
}

module.exports = new EncryptionService();
