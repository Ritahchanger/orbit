#!/usr/bin/env node
// Creates the platform admin (Orbit's own staff account for /platform) from
// PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD in .env. Running it again
// resets that admin's password to the one in .env.
//
//   npm run seed:platform-admin
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDb = require("../config/db.connection");
const User = require("../user/models/user.model");
// Saving a user looks up its Role (user.model's pre-save hook), so the Role
// model must be registered even though this script doesn't use it directly.
require("../permissions/models/role.model");

const seed = async () => {
  const email = process.env.PLATFORM_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.PLATFORM_ADMIN_PASSWORD;

  if (!email || !password) throw new Error("Set PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD in .env");
  if (password.length < 12) throw new Error("PLATFORM_ADMIN_PASSWORD must be at least 12 characters");

  await connectDb();

  const existing = await User.findOne({ email });
  if (existing && existing.role !== "platform_admin") {
    throw new Error(`${email} belongs to a business user; use a different email`);
  }

  const hashed = await bcrypt.hash(password, 12);
  if (existing) {
    existing.password = hashed;
    await existing.save();
    console.log(`✓ Password updated for platform admin ${email}`);
  } else {
    await User.create({ email, password: hashed, firstName: "Platform", lastName: "Admin", role: "platform_admin" });
    console.log(`✓ Platform admin ${email} created. Sign in at /platform/login`);
  }
};

seed()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(`✗ ${error.message}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
