#!/usr/bin/env node
// Creates a platform admin: Orbit's own staff account for the platform
// dashboard (/platform). Platform admins belong to no business and can only
// be created here, never through the API.
//
//   npm run platform:create-admin -- --email you@orbit.com --password '<12+ chars>' \
//     [--first Jane] [--last Doe]
//   npm run platform:create-admin -- --email you@orbit.com --password '<new>' --reset
//
// --reset sets a new password on an existing platform admin.
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDb = require("../config/db.connection");
const User = require("../user/models/user.model");

const MIN_PASSWORD_LENGTH = 12;

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const fail = (message) => {
  console.error(`✗ ${message}`);
  process.exit(1);
};

const main = async () => {
  const email = arg("email")?.toLowerCase().trim();
  const password = arg("password");
  const reset = process.argv.includes("--reset");

  if (!email || !password) {
    fail("Usage: --email <email> --password <password> [--first <name>] [--last <name>] [--reset]");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  await connectDb();

  const existing = await User.findOne({ email });
  const hashed = await bcrypt.hash(password, 12);

  if (existing) {
    if (existing.role !== "platform_admin") {
      fail(`${email} already belongs to a business user; use a different email`);
    }
    if (!reset) fail(`${email} is already a platform admin (pass --reset to change the password)`);

    existing.password = hashed;
    await existing.save();
    console.log(`✓ Password reset for platform admin ${email}`);
  } else {
    await User.create({
      email,
      password: hashed,
      firstName: arg("first") || "Platform",
      lastName: arg("last") || "Admin",
      role: "platform_admin",
      canAccessAllStores: false,
    });
    console.log(`✓ Platform admin ${email} created. Sign in at /platform/login`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

main().catch((error) => fail(error.message));
