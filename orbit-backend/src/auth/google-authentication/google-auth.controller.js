// controllers/auth.controller.js
const GoogleAuthService = require("./google-auth.service");

require("dotenv").config();

class AuthController {
  loginFailed(req, res) {
    return res.status(401).json(GoogleAuthService.handleLoginFailed());
  }

  logout(req, res) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });

    // For API requests, return JSON instead of redirect
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
        }
        return res.status(200).json({
          success: true,
          message: "Logged out successfully",
        });
      });
    } else {
      // For browser redirects (if someone visits logout directly)
      req.logout(() => {
        return res.redirect(process.env.CLIENT_URL);
      });
    }
  }

  loginSuccess(req, res) {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: "No authenticated user.",
      });
    }

    console.log(req.user);

    const responseData = GoogleAuthService.handleLoginSuccess(
      req.user,
      req.cookies
    );

    return res.status(200).json(responseData);
  }

  // controllers/auth.controller.js
  async googleCallback(req, res) {
    console.log("🔄 Google callback received");
  
    if (!req.user) {
      console.error("❌ No user in Google callback");
      return res.redirect(`${process.env.CLIENT_URL}/auth/login?error=no_user`);
    }
  
    console.log("📋 Raw Google profile:", {
      id: req.user.id,
      displayName: req.user.displayName,
      emails: req.user.emails,
      provider: req.user.provider,
    });
  
    const googleUser = await GoogleAuthService.findOrCreateGoogleUser(req.user);
  
    console.log("✅ Google user processed:", {
      userId: googleUser.user._id,
      email: googleUser.user.email,
      firstName: googleUser.user.firstName,
      lastName: googleUser.user.lastName,
      hasToken: !!googleUser.token,
    });
  
    // Set HTTP-only cookie
    res.cookie("token", googleUser.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  
    // Get the intended path with proper decoding
    let intendedPath = "/admin"; // default
  
    // 1. First try state parameter (with proper decoding)
    if (req.query.state) {
      try {
        // Decode the URL-encoded state parameter
        const decodedState = decodeURIComponent(req.query.state);
        console.log("🎯 Decoded state parameter:", decodedState);
        
        // Check if this is a redirect URL from protected route
        if (decodedState.includes('/auth/login?redirect=')) {
          // Extract the actual destination from redirect parameter
          const urlParams = new URLSearchParams(decodedState.split('?')[1]);
          intendedPath = urlParams.get('redirect') || "/admin";
          console.log("🎯 Extracted destination from redirect:", intendedPath);
        } else {
          // Use the state directly if it's not a redirect URL
          intendedPath = decodedState;
          console.log("🎯 Using state as intended path:", intendedPath);
        }
      } catch (error) {
        console.error("❌ Error decoding state parameter:", error);
      }
    }
    // 2. Fallback to session
    else if (req.session?.intendedPath) {
      intendedPath = req.session.intendedPath;
      console.log("🎯 Using intended path from session:", intendedPath);
    }
  
    // Clean up session
    if (req.session) {
      delete req.session.intendedPath;
    }
  
    // Ensure intendedPath is a valid path (starts with / and doesn't contain multiple tokens)
    if (!intendedPath.startsWith('/')) {
      intendedPath = '/' + intendedPath;
    }
  
    // Remove any existing token parameters from intendedPath to avoid duplicates
    intendedPath = intendedPath.split('?')[0];
  
    // Build the final redirect URL
    const finalUrl = `${process.env.CLIENT_URL}${intendedPath}?token=${googleUser.token}`;
  
    console.log("🔗 Redirecting to:", finalUrl);
  
    return res.redirect(finalUrl);
  }
}

module.exports = new AuthController();
