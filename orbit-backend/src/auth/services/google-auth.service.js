// services/auth.service.js


const { generateToken } = require("../../utils/generateToken");
const log = require("../../utils/log");
const {
  createUser,
  findUser,
  findUserById,
} = require("../../user");

class GoogleAuthService {
  async findOrCreateGoogleUser(googleProfile) {
    const { _json } = googleProfile;

    const googleId = _json.sub;
    const firstName = _json.given_name;
    const lastName = _json.family_name;
    const profileImage = _json.picture;
    const email = googleProfile.emails?.[0]?.value || null; // may need scope 'email'

    // Try to find an existing user
    let user = await findUser({ email }).select("-password");

    if (!user) {
      const newUser = await createUser({
        email: email || `${googleId}@google-user.com`, // fallback
        firstName,
        lastName,
        profileImage,
        password: googleId, // or a random hash
        role: "normal-user",
      });

      user = await findUserById(newUser._id).select("-password");

      log.debug("✅ Created new Google user:", user.email);

    } else {

      log.debug("✅ Google user already exists:", user.email);
      
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
    log.debug("=== GOOGLE USER CREDENTIALS ===");
    log.debug("Full user object:", user);
    log.debug("================================");
  }
}

module.exports = new GoogleAuthService();
