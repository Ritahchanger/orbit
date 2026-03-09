const User = require("../../user/user.model");

const bcrypt = require("bcryptjs");

const {
  generateToken,
  generateRefreshToken,
} = require("../../utils/generateToken");

const passwordGeneration = require("../../utils/generateStrongPassword");

const RefreshToken = require("../../auth/models/refreshTokenSchema");

const {
  resolveUserPermissions,
} = require("../../permissions/services/permission.service");

const Role = require("../../permissions/models/role.model");

const mongoose = require("mongoose");

const registerUser = async (userData) => {
  const requiredFields = ["email", "firstName", "lastName"];

  const missingFields = requiredFields.filter((field) => !userData[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const existingUser = await User.findOne({
    email: userData.email.toLowerCase().trim(),
  });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error("Please provide a valid email address");
  }

  const password = userData.password;
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Process storeRoles based on user role and assignedStore
  const processStoreRoles = () => {
    const { role, assignedStore, storeRoles = [] } = userData;

    // If no storeRoles provided but has assignedStore, create default
    if (assignedStore && (!storeRoles || storeRoles.length === 0)) {
      // Determine default store role based on user role
      let defaultStoreRole = "staff";
      if (role === "manager" || role === "admin" || role === "superadmin") {
        defaultStoreRole = "manager";
      }

      return [
        {
          store: assignedStore,
          role: defaultStoreRole,
        },
      ];
    }

    // If storeRoles are provided, ensure consistency with user role
    if (storeRoles && storeRoles.length > 0) {
      return storeRoles.map((storeRole) => {
        const processedRole = { ...storeRole };

        // If this is the assigned store and user is a manager/admin/superadmin,
        // ensure the store role reflects this authority
        if (
          assignedStore &&
          storeRole.store &&
          storeRole.store.toString() === assignedStore.toString() &&
          (role === "manager" || role === "admin" || role === "superadmin")
        ) {
          // Manager/Admin/Superadmin should have at least manager role in their assigned store
          if (storeRole.role !== "manager") {
            processedRole.role = "manager";
          }
        }

        return processedRole;
      });
    }

    return [];
  };

  // Process storePermissions based on storeRoles
  const processStorePermissions = () => {
    const { role, assignedStore, storePermissions = [] } = userData;
    const finalStoreRoles = processStoreRoles();

    // Start with existing permissions
    let processedPermissions = [...storePermissions];

    // For each storeRole, ensure appropriate permissions exist
    finalStoreRoles.forEach((storeRole) => {
      const storeId = storeRole.store;
      const existingPermIndex = processedPermissions.findIndex(
        (perm) => perm.store && perm.store.toString() === storeId.toString(),
      );

      // Default permissions based on store role
      let defaultPerms = {
        store: storeId,
        canView: true,
        canEdit: false,
        canSell: false,
        canManage: false,
      };

      // Set permissions based on store role
      switch (storeRole.role) {
        case "manager":
          defaultPerms = {
            store: storeId,
            canView: true,
            canEdit: true,
            canSell: true,
            canManage: true,
          };
          break;
        case "cashier":
          defaultPerms = {
            store: storeId,
            canView: true,
            canEdit: false,
            canSell: true,
            canManage: false,
          };
          break;
        case "staff":
          defaultPerms = {
            store: storeId,
            canView: true,
            canEdit: true,
            canSell: false,
            canManage: false,
          };
          break;
        case "viewer":
          defaultPerms = {
            store: storeId,
            canView: true,
            canEdit: false,
            canSell: false,
            canManage: false,
          };
          break;
      }

      if (existingPermIndex >= 0) {
        // Merge with existing, but ensure minimum permissions
        processedPermissions[existingPermIndex] = {
          ...processedPermissions[existingPermIndex],
          ...defaultPerms,
        };
      } else {
        processedPermissions.push(defaultPerms);
      }
    });

    return processedPermissions;
  };

  // Get processed roles and permissions
  const processedStoreRoles = processStoreRoles();
  const processedStorePermissions = processStorePermissions();

  // Validate store roles
  const validStoreRoles = ["manager", "cashier", "staff"];
  processedStoreRoles.forEach((storeRole) => {
    if (!validStoreRoles.includes(storeRole.role)) {
      throw new Error(
        `Invalid store role: ${storeRole.role}. Must be one of: ${validStoreRoles.join(", ")}`,
      );
    }
  });

  // Create the user with processed data
  const user = await User.create({
    email: userData.email.toLowerCase().trim(),
    password: hashedPassword,
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    company: userData.company?.trim() || "",
    phoneNo: userData.phoneNo?.trim() || "",
    newsletter: userData.newsletter !== undefined ? userData.newsletter : true,
    role: userData.role || "staff",
    assignedStore: userData.assignedStore || null,
    canAccessAllStores:
      userData.canAccessAllStores || userData.role === "superadmin",
    storePermissions: processedStorePermissions,
    storeRoles: processedStoreRoles,
  });

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  return userWithoutPassword;
};

const loginAdmin = async (email, password) => {
  try {
    console.log("1. Login attempt for email:", email);

    if (!email || !password) {
      console.log("2. Missing credentials");
      throw new Error("Email and password are required");
    }

    console.log("3. Looking up user...");
    const user = await User.findOne({ email }).populate(
      "assignedStore",
      "name code",
    );
    console.log("4. User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("5. User not found");
      throw new Error("Invalid email or password");
    }

    console.log("6. Resolving permissions...");
    const permissions = await resolveUserPermissions(user._id);
    console.log("7. Permissions resolved:", permissions?.length || 0);

    if (user.isSuspended) {
      console.log("8. User is suspended");
      throw new Error(
        "Your account has been suspended. Contact the administrator.",
      );
    }

    console.log("9. Comparing password...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("10. Password match:", isMatch);

    if (!isMatch) {
      console.log("11. Password mismatch");
      throw new Error("Invalid email or password");
    }

    console.log("12. Generating token...");
    const accessToken = generateToken({
      user,
      permissions: permissions.map((p) => p.key),
    });

    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in database
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    console.log("13. Token generated successfully");

    return { user, token: accessToken, refreshToken };
  } catch (error) {
    console.error("❌ Login service error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

const getCurrentAdmin = async (adminId) => {
  const user = await User.findById(adminId)
    .select("-password")
    .populate("assignedStore", "name code location")
    .populate("storePermissions.store", "name code")
    .populate("storeRoles.store", "name code")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  // Create a user instance for method calls
  const userInstance = await User.findById(adminId);

  // Get all permissions
  const allPermissions = await userInstance.getAllPermissions();

  // Get accessible stores
  const accessibleStores = await userInstance.getAccessibleStores();

  // Get role details
  const Role = mongoose.model("Role");
  const roleDetails = await Role.findOne({ name: user.role })
    .select("name permissions description level")
    .lean();

  // Build the enhanced response object
  const response = {
    ...user,
    permissions: allPermissions,
    accessibleStores: accessibleStores,
    roleDetails: roleDetails,

    // Store access information
    storeAccess: {
      assignedStore: user.assignedStore,
      canAccessAllStores: user.canAccessAllStores,
      storePermissions: user.storePermissions,
      storeRoles: user.storeRoles,
    },

    // Attach permission checking methods
    hasPermission: async (permissionKey, storeId = null) => {
      return userInstance.hasPermission(permissionKey, storeId);
    },

    hasStorePermission: async (storeId, permissionKey) => {
      return userInstance.hasStorePermission(storeId, permissionKey);
    },

    canAccessStore: async (storeId) => {
      return userInstance.canAccessStore(storeId);
    },

    getStorePermissions: async (storeId) => {
      return userInstance.getStorePermissions(storeId);
    },

    // Quick permission checkers
    can: {
      manageUsers: await userInstance.hasPermission("users.manage"),
      manageStores: await userInstance.hasPermission("stores.manage"),
      viewReports: await userInstance.hasPermission("reports.view"),
      createSales: await userInstance.hasPermission("sales.create"),
    },
  };

  return response;
};

const changeAdminPassword = async (adminId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error("Both current and new passwords are required");
  }

  const user = await User.findById(adminId);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();

  return { message: "Password updated successfully" };
};

module.exports = {
  registerUser,
  loginAdmin,
  changeAdminPassword,
  getCurrentAdmin,
};
