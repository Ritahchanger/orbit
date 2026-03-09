const userService = require("./user.service");
require("dotenv").config();

// ============ EXISTING CONTROLLERS ============

const getAllAdmins = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "-createdAt",
  } = req.query;

  const result = await userService.fetchAllAdmins({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    sortBy,
  });

  res.status(200).json(result);
};

const getAdminById = async (req, res) => {
  const { id } = req.params;
  const admin = await userService.fetchAdminById(id);

  res.status(200).json({
    success: true,
    data: admin,
  });
};

const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  const result = await userService.deleteAdminById(id);

  res.status(200).json(result);
};

const getUsers = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    role = "",
    sortBy = "-createdAt",
    newsletter,
    storeId,
  } = req.query;

  const result = await userService.getAllUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    role,
    sortBy,
    newsletter,
    storeId,
  });

  res.status(200).json(result);
};

const getUserStatistics = async (req, res) => {
  const result = await userService.getUserStats();
  res.status(200).json(result);
};

// ============ NEW CONTROLLERS ============

// Get user with detailed permissions
const getUserWithPermissions = async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserWithPermissions(id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const updateData = req.body;

  // Use the authenticated user's ID from the token
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID not found in authentication token",
    });
  }

  const user = await userService.updateUserProfile(userId, updateData);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
};

// Change user password
const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }
    if (req.user?._id.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only change your own password",
      });
    }
    const result = await userService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );
    console.log(`Password changed successfully for user: ${userId}`);
    if (result.invalidatedSessions) {
      return res.status(200).json({
        success: true,
        message:
          "Password changed successfully. Please log in again on other devices.",
        requireRelogin: true,
      });
    }
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password controller error:", error);
    if (error.message === "Current password is incorrect") {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (
      error.message.includes("Cannot reuse") ||
      error.message.includes("Password history")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "An error occurred while changing password. Please try again.",
    });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Only admin/superadmin can update roles
  if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Admin privileges required",
    });
  }

  const user = await userService.updateUserRole(id, role, req.user?.role);

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: user,
  });
};

// Assign store to user
const assignStoreToUser = async (req, res) => {
  const userId = req.user?._id;
  const { storeId, permissions } = req.body;

  // Only admin/superadmin can assign stores
  if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Admin privileges required",
    });
  }

  const user = await userService.assignStoreToUser(
    userId,
    storeId,
    permissions,
  );

  res.status(200).json({
    success: true,
    message: "Store assigned successfully",
    data: user,
  });
};

// Remove store from user
const removeStoreFromUser = async (req, res) => {
  const { storeId } = req.params;

  const userId = req.user?._id;

  // Only admin/superadmin can remove stores
  if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Admin privileges required",
    });
  }

  const user = await userService.removeStoreFromUser(userId, storeId);

  res.status(200).json({
    success: true,
    message: "Store removed successfully",
    data: user,
  });
};

// Set user's primary store
const setPrimaryStore = async (req, res) => {
  const userId = req.user?._id;
  const { storeId } = req.body;

  // Users can only set their own primary store, admins can set for anyone
  if (
    req.user?.id !== userId &&
    req.user?.role !== "admin" &&
    req.user?.role !== "superadmin"
  ) {
    return res.status(403).json({
      success: false,
      message: "You can only set your own primary store",
    });
  }

  const user = await userService.setPrimaryStore(userId, storeId);

  res.status(200).json({
    success: true,
    message: storeId
      ? "Primary store set successfully"
      : "Primary store cleared",
    data: user,
  });
};

// Get user's store permissions
const getUserStorePermissions = async (req, res) => {
  const { storeId } = req.params;

  const userId = req.user?._id;

  const permissions = await userService.getUserStorePermissions(
    userId,
    storeId,
  );

  res.status(200).json({
    success: true,
    data: permissions,
  });
};

// Get user's accessible stores
const getUserAccessibleStores = async (req, res) => {
  const userId = req.user?._id;

  const stores = await userService.getUserAccessibleStores(userId);

  res.status(200).json({
    success: true,
    data: stores,
  });
};

// Register user (kept from original)
const registerUser = async (req, res) => {
  const userData = req.body;
  const user = await userService.registerUser(userData);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
};

// Login admin (kept from original)
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const result = await userService.loginAdmin(email, password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

const suspendUserController = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { reason } = req.body;

    // Logged-in admin
    const adminId = req.user.id;
    const adminRole = req.user.role;

    // Authorization check
    if (!["admin", "superadmin"].includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to suspend users",
      });
    }

    const result = await userService.suspendUser(userId, adminId, reason);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const unsuspendUserController = async (req, res) => {
  const { id: userId } = req.params;
  const adminRole = req.user.role;

  if (!["admin", "superadmin"].includes(adminRole)) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to unsuspend users",
    });
  }
  const result = await userService.unsuspendUser(userId);
  return res.status(200).json(result);
};

module.exports = {
  // Original controllers
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  getUsers,
  getUserStatistics,
  suspendUserController,
  unsuspendUserController,
  // New controllers
  getUserWithPermissions,
  updateUserProfile,
  changePassword,
  updateUserRole,
  assignStoreToUser,
  removeStoreFromUser,
  setPrimaryStore,
  getUserStorePermissions,
  getUserAccessibleStores,

  // Auth controllers (kept as is)
  registerUser,
  loginAdmin,
};
