const {
  userSignupValidator,
  userLoginValidator,
} = require("../../validators/auth.validator");

const normalUserAuthService = require("./normal-auth.service");

const { transporter } = require("../../utils/transporter");

const { getWelcomeEmailTemplate } = require("../../utils/emailTemplate");

const Store = require("../../stores/store.model");

require("dotenv").config();

const signUp = async (req, res) => {
  console.log(req.body);

  const { error, value: validatedData } = userSignupValidator.validate(
    req.body,
  );

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { email, firstName, lastName, profileImage } = validatedData;

  const finalProfileImage =
    profileImage && profileImage.trim() !== "" ? profileImage : "";

  const generateRandomPassword = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    let password = "";
    for (let i = 0; i < 3; i++) {
      password += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    password += "-";

    for (let i = 0; i < 4; i++) {
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return password;
  };

  const randomPassword = generateRandomPassword();

  const userDataWithPassword = {
    ...validatedData,
    profileImage: finalProfileImage,
    password: randomPassword,
  };

  const newUser =
    await normalUserAuthService.registerUser(userDataWithPassword);

  const loginUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/admin/login`
    : "https://yourwebsite.com/login";

  const emailHtml = getWelcomeEmailTemplate({
    firstName,
    lastName,
    email,
    password: randomPassword,
    loginUrl,
  });

  await transporter.sendMail({
    from: process.env.COMPANY_EMAIL,
    to: email,
    subject: "Your Mega Gamers Account Has Been Created",
    html: emailHtml,
  });

  res.status(201).json({
    success: true,
    message: "Account registered successfully. Password sent to email.",
    data: {
      user: newUser,
    },
  });
};

const signIn = async (req, res, next) => {
  // Validate request body
  const { error } = userLoginValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password, businessId } = req.body;

  try {
    const { user, token, refreshToken } =
      await normalUserAuthService.loginAdmin(email, password, businessId);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = {
      success: true,
      message: "Login successful",
      token: token,
      userId: user._id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    if (user.assignedStore) {
      let storeData;
      if (user.assignedStore._id) {
        storeData = {
          storeId: user.assignedStore._id,
          storeName: user.assignedStore.name,
          storeCode: user.assignedStore.code,
        };
      } else {
        const store = await Store.findById(user.assignedStore);
        if (store) {
          storeData = {
            storeId: store._id,
            storeName: store.name,
            storeCode: store.code,
          };
        }
      }
      if (storeData) {
        responseData.store = storeData;
      }
    }

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// normal-auth.controller.js
const refreshToken = async (req, res, next) => {
  try {
    const { accessToken, newRefreshToken } =
      await normalUserAuthService.rotateRefreshToken(
        req.user,
        req.refreshTokenDoc,
        req.businessId,
      );

    // Overwrite the old httpOnly refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Overwrite the old access token cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: accessToken, // also send in body for clients that read it
      userId: req.user._id,
      role: req.user.role,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  const adminId = req.user.id;

  const admin = await normalUserAuthService.getCurrentAdmin(adminId);

  res.status(200).json({
    success: true,
    data: admin,
  });
};

const changePasswordController = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide both current and new password");
  }

  const result = await normalUserAuthService.changeAdminPassword(
    req.user.id,
    currentPassword,
    newPassword,
  );
  res.status(200).json({ success: true, result });
};

const impersonateUser = async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res
      .status(403)
      .json({ success: false, message: "Only superadmins can impersonate users" });
  }

  const { userId } = req.params;
  const User = require("../../user/user.model");

  const target = await User.findOne({
    _id: userId,
    businessId: req.businessId,
  }).select("-password");

  if (!target) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (target.role === "superadmin") {
    return res
      .status(403)
      .json({ success: false, message: "Cannot impersonate another superadmin" });
  }

  const jwt = require("jsonwebtoken");
  const impersonationToken = jwt.sign(
    {
      id: target._id,
      role: target.role,
      firstName: target.firstName,
      impersonatedBy: req.user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return res.status(200).json({
    success: true,
    message: `Now impersonating ${target.firstName} ${target.lastName}`,
    data: {
      impersonationToken,
      targetUser: {
        _id: target._id,
        email: target.email,
        firstName: target.firstName,
        lastName: target.lastName,
        role: target.role,
        assignedStore: target.assignedStore,
      },
    },
  });
};

module.exports = {
  signIn,
  signUp,
  getMe,
  changePasswordController,
  refreshToken,
  impersonateUser,
};
