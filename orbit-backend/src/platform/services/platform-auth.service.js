// services/platform-auth.service.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CustomError = require("../../errors/CustomError");
const { findUser, recordUserLogin } = require("../../user");
const { PLATFORM_SCOPE } = require("../middlewares/platform-auth.middleware");
require("dotenv").config();

const SESSION_HOURS = 8;

// Compared against when the email doesn't match an admin, so a wrong email
// takes as long as a wrong password and doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("orbit-platform-dummy-password", 10);

const toPublicAdmin = (admin) => ({
  id: admin._id,
  firstName: admin.firstName,
  lastName: admin.lastName,
  email: admin.email,
});

const login = async (email, password) => {
  if (!email || !password) {
    throw CustomError.badRequest("Email and password are required");
  }

  const admin = await findUser({
    email: String(email).toLowerCase().trim(),
    role: "platform_admin",
  });

  const passwordOk = await bcrypt.compare(
    String(password),
    admin?.password || DUMMY_HASH,
  );

  if (!admin || !passwordOk || admin.isSuspended || admin.isActive === false) {
    throw CustomError.unauthorized("Invalid email or password");
  }

  await recordUserLogin(admin._id);

  const token = jwt.sign(
    { id: admin._id, scope: PLATFORM_SCOPE },
    process.env.JWT_SECRET,
    { expiresIn: `${SESSION_HOURS}h` },
  );

  return { admin: toPublicAdmin(admin), token, maxAge: SESSION_HOURS * 60 * 60 * 1000 };
};

module.exports = { login, toPublicAdmin };
