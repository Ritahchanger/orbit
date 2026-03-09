// services/auth.service.js

const User = require("../../user/user.model");

const { generateToken } = require("../../utils/generateToken");

class GoogleAuthService {
  async findOrCreateGoogleUser(googleProfile) {
    const { _json } = googleProfile;

    const googleId = _json.sub;
    const firstName = _json.given_name;
    const lastName = _json.family_name;
    const profileImage = _json.picture;
    const email = googleProfile.emails?.[0]?.value || null; // may need scope 'email'

    // Try to find an existing user
    let user = await User.findOne({ email }).select("-password");

    if (!user) {
      const newUser = await User.create({
        email: email || `${googleId}@google-user.com`, // fallback
        firstName,
        lastName,
        profileImage,
        password: googleId, // or a random hash
        role: "normal-user",
      });

      user = await User.findById(newUser._id).select("-password");

      console.log("✅ Created new Google user:", user.email);

    } else {

      console.log("✅ Google user already exists:", user.email);
      
    }

    const token = generateToken(user._id);

  

    return { user, token };
  }

  handleLoginFailed() {
    return {
      success: false,
      message: "User failed to authenticate.",
    };
  }

  handleLoginSuccess(user, cookies) {
    return {
      success: true,
      message: "Access Granted",
      user,
      cookies,
    };
  }

  processGoogleUser(user) {
    console.log("=== GOOGLE USER CREDENTIALS ===");
    console.log("Full user object:", user);
    console.log("================================");
  }
}

module.exports = new GoogleAuthService();
