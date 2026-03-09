#!/usr/bin/env node

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDb = require("../config/db.connection");

// Default superadmin credentials
const DEFAULT_EMAIL = "superadmin@orbit.com";
const DEFAULT_PASSWORD = "MyOrbitSecureSuperAdmin123!";

// Superadmin seed template
const superadminSeed = {
  email: DEFAULT_EMAIL,
  password: DEFAULT_PASSWORD,
  firstName: "Super",
  lastName: "Admin",
  company: "Admin Company",
  phoneNo: "+1234567890",
  newsletter: false,
  profileImage: "",
  role: "superadmin", // This should be a string
  isActive: true,
};

// TEMPORARY: Create a simple User model without Role dependencies
// This bypasses the User model's methods that need Role model
function createSimpleUserModel() {
  console.log("🔧 Creating simple User model for seeding...");

  const SimpleUserSchema = new mongoose.Schema(
    {
      email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
      },
      firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
      },
      lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
      },
      phoneNo: {
        type: String,
        trim: true,
        default: "",
      },
      newsletter: {
        type: Boolean,
        default: true,
      },
      role: {
        type: String,
        required: true,
        default: "staff",
        enum: ["superadmin", "admin", "manager", "cashier", "staff"],
      },
      profileImage: {
        type: String,
        default: "",
      },
      assignedStore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        default: null,
      },
      canAccessAllStores: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      lastLoginAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
      toJSON: {
        transform: function (doc, ret) {
          delete ret.password;
          return ret;
        },
      },
    },
  );

  // Override the existing User model temporarily
  if (mongoose.models.User) {
    delete mongoose.models.User;
  }

  return mongoose.model("User", SimpleUserSchema);
}

const createSuperAdmin = async (customEmail, customPassword) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error(
        "MongoDB is not connected. Please ensure your database is running.",
      );
    }

    // Use custom email/password if provided
    const seedData = { ...superadminSeed };
    if (customEmail) seedData.email = customEmail;
    if (customPassword) seedData.password = customPassword;

    console.log(`📧 Creating superadmin with email: ${seedData.email}`);

    // Use simple User model (bypasses Role dependency)
    const SimpleUser = createSimpleUserModel();

    // Check if superadmin user exists (by email OR by role)
    const existingSuperadmin = await SimpleUser.findOne({
      $or: [{ email: seedData.email }, { role: "superadmin" }],
    });

    if (existingSuperadmin) {
      console.log("✅ Superadmin already exists:");
      console.log("   Email:", existingSuperadmin.email);
      console.log(
        "   Name:",
        existingSuperadmin.firstName,
        existingSuperadmin.lastName,
      );
      console.log("   Role:", existingSuperadmin.role);
      console.log("   Created:", existingSuperadmin.createdAt);
      return existingSuperadmin;
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(seedData.password, salt);

    // Create user with string role
    const superadmin = new SimpleUser({
      ...seedData,
      password: hashedPassword,
      canAccessAllStores: true, // Superadmin can access all stores
      lastLoginAt: new Date(),
    });

    await superadmin.save();

    console.log("✅ Superadmin created successfully:");
    console.log("   Email:", superadmin.email);
    console.log("   Name:", superadmin.firstName, superadmin.lastName);
    console.log("   Role:", superadmin.role);
    console.log("   User ID:", superadmin._id);
    console.log("   Can access all stores: Yes");

    return superadmin;
  } catch (error) {
    console.error("❌ Error creating superadmin:", error.message);

    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((field) => {
        console.error(`   - ${field}: ${error.errors[field].message}`);
      });
    }

    if (error.code === 11000) {
      console.error("   ❗ Duplicate email - user already exists");
    }

    throw error;
  }
};

// CLI functionality
const run = async () => {
  const args = process.argv.slice(2);

  // Help command
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
SuperAdmin Creation Tool
========================

Usage: npm run create-superadmin [options]

Options:
  --help, -h     Show this help message
  --force, -f    Force create superadmin (delete existing)
  --info, -i     Show superadmin info
  --email <email>    Set custom email
  --password <pass>  Set custom password
  --verbose, -v  Show detailed output

Examples:
  npm run create-superadmin
  npm run create-superadmin --email admin@company.com
  npm run create-superadmin --email admin@company.com --password MyPass123
  npm run create-superadmin --force
  npm run create-superadmin --info
  npm run create-superadmin --verbose
    `);
    process.exit(0);
  }

  // Verbose mode
  const verbose = args.includes("--verbose") || args.includes("-v");

  // Handle custom email and password
  let customEmail = null;
  let customPassword = null;

  const emailIndex = args.indexOf("--email");
  if (emailIndex !== -1 && args[emailIndex + 1]) {
    customEmail = args[emailIndex + 1];
  }

  const passwordIndex = args.indexOf("--password");
  if (passwordIndex !== -1 && args[passwordIndex + 1]) {
    customPassword = args[passwordIndex + 1];
  }

  // Info command
  if (args.includes("--info") || args.includes("-i")) {
    try {
      // Use the real User model for info (it should be loaded by now)
      const User = require("../user/user.model");
      const superadmin = await User.findOne({ role: "superadmin" });

      if (superadmin) {
        console.log("📋 Superadmin Info:");
        console.log("   Email:", superadmin.email);
        console.log("   Name:", superadmin.firstName, superadmin.lastName);
        console.log("   Role:", superadmin.role);
        console.log("   Company:", superadmin.company);
        console.log(
          "   Status:",
          superadmin.isActive ? "🟢 Active" : "🔴 Inactive",
        );
        console.log("   Created:", superadmin.createdAt.toLocaleString());

        if (verbose) {
          console.log("   User ID:", superadmin._id);
          console.log(
            "   Last Login:",
            superadmin.lastLoginAt
              ? superadmin.lastLoginAt.toLocaleString()
              : "Never",
          );
          console.log("   Phone:", superadmin.phoneNo);
        }
      } else {
        console.log("❌ No superadmin found in database");
        console.log("💡 Run: npm run create-superadmin to create one");
      }
    } catch (error) {
      console.error("❌ Error fetching superadmin info:", error.message);
    }
    process.exit(0);
  }

  // Force create command
  if (args.includes("--force") || args.includes("-f")) {
    try {
      // Use simple model for deletion
      const SimpleUser = createSimpleUserModel();
      const result = await SimpleUser.deleteMany({ role: "superadmin" });
      console.log(
        `🗑️  Removed ${result.deletedCount} existing superadmin user(s)`,
      );

      // Also delete by email if provided
      if (customEmail) {
        const emailResult = await SimpleUser.deleteOne({ email: customEmail });
        if (emailResult.deletedCount > 0) {
          console.log(`🗑️  Also removed user with email: ${customEmail}`);
        }
      }
    } catch (error) {
      console.error("❌ Error removing existing superadmin:", error.message);
      if (verbose) console.error("Details:", error);
    }
  }

  // Main execution
  try {
    console.log("🚀 Starting superadmin creation...");
    await createSuperAdmin(customEmail, customPassword);
    console.log("🎉 Superadmin setup completed!");

    // Show login info
    if (customEmail) {
      console.log("\n🔐 Login Credentials:");
      console.log("   Email:", customEmail);
      console.log("   Password:", customPassword || DEFAULT_PASSWORD);
      console.log("   Role: superadmin");
    }
  } catch (error) {
    console.error("💥 Failed to create superadmin");
    process.exit(1);
  }
};

// Safety check: prevent accidental execution in production
const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !process.argv.includes("--force")) {
  console.error("🚨 WARNING: Running in production mode!");
  console.error("Add --force flag if you're sure:");
  console.error("  npm run create-superadmin -- --force");
  process.exit(1);
}

// Only run if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      // Use the imported database connection
      await connectDb();

      const dbName = mongoose.connection.db?.databaseName || "unknown";
      const host = mongoose.connection.host || "unknown";
      console.log(`📦 Connected to MongoDB: ${host}/${dbName}`);

      await run();

      // Close the connection
      await mongoose.connection.close();
      console.log("🔌 Database connection closed");
      process.exit(0);
    } catch (error) {
      console.error("💥 Script failed:", error.message);
      if (verbose) console.error("Full error:", error);
      process.exit(1);
    }
  })();
}

module.exports = { superadminSeed, createSuperAdmin };
