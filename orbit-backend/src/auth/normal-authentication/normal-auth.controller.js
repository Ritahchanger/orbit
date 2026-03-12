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
    // Attempt to login
    const { user, token, refreshToken } =
      await normalUserAuthService.loginAdmin(email, password, businessId);

    // Set access token cookie (1 hour)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Set refresh token cookie (7 days) - HIDDEN from frontend
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/", // ✅ Sent to all paths
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Prepare response data - SAME as before! Frontend doesn't know about refresh token
    const responseData = {
      success: true,
      message: "Login successful",
      token: token, // Same property name - UI unchanged
      userId: user._id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    // Store info (unchanged)
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

module.exports = { signIn, signUp, getMe, changePasswordController };
