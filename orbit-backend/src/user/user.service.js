const User = require("./user.model");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

// ============ KEEP THESE UNCHANGED ============
const registerUser = async (userData) => {
  const requiredFields = ["email", "password", "firstName", "lastName"];

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

  if (userData.password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const user = await User.create({
    email: userData.email.toLowerCase().trim(),
    password: hashedPassword,
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    phoneNo: userData.phoneNo?.trim() || "",
    newsletter: userData.newsletter !== undefined ? userData.newsletter : true,
    role: userData.role || "normal-user",
  });

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  return userWithoutPassword;
};

// Login user - KEEP UNCHANGED
const loginAdmin = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = generateToken(user._id);
  return { user, token };
};
// ============ END UNCHANGED FUNCTIONS ============

// ============ IMPROVED FUNCTIONS ============

// Fetch single user by ID (without password)
const fetchAdminById = async (id) => {
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid user ID format");
  }

  const user = await User.findById(id)
    .select("-password")
    .populate("assignedStore", "name location status")
    .populate("storePermissions.store", "name")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Fetch user with store permissions
const getUserWithPermissions = async (id) => {
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid user ID format");
  }

  const user = await User.findById(id)
    .select("-password")
    .populate("assignedStore", "name location status")
    .populate("storePermissions.store", "name location status")
    .populate("storeRoles.store", "name")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update user profile - FIXED VERSION
const updateUserProfile = async (id, updateData) => {
  // Convert id to string if it's an ObjectId
  const userIdStr = id.toString ? id.toString() : String(id);

  // Use Mongoose validation instead of .match()
  const mongoose = require("mongoose");

  if (!mongoose.Types.ObjectId.isValid(userIdStr)) {
    throw new Error(`Invalid user ID format: ${userIdStr}`);
  }

  // Fields that cannot be updated through this endpoint
  const restrictedFields = ["password", "email", "role"];
  restrictedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      delete updateData[field];
    }
  });

  // Trim string fields
  if (updateData.firstName) updateData.firstName = updateData.firstName.trim();
  if (updateData.lastName) updateData.lastName = updateData.lastName.trim();
  if (updateData.phoneNo) updateData.phoneNo = updateData.phoneNo.trim();

  const user = await User.findByIdAndUpdate(
    userIdStr, // Use the string version
    { $set: updateData },
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
// Change user password - FIXED VERSION
const changePassword = async (id, currentPassword, newPassword) => {
  // Make sure mongoose is imported at the top of your file
  const mongoose = require("mongoose");

  // Convert id to string if it's an ObjectId
  const userIdStr = id.toString ? id.toString() : String(id);

  // Use Mongoose validation instead of .match()
  if (!mongoose.Types.ObjectId.isValid(userIdStr)) {
    throw new Error(`Invalid user ID format: ${userIdStr}`);
  }

  if (!currentPassword || !newPassword) {
    throw new Error("Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long");
  }

  const user = await User.findById(userIdStr);
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  await user.save();

  return { message: "Password updated successfully" };
};

// Update user role (admin only)
const updateUserRole = async (id, newRole, requesterRole) => {
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid user ID format");
  }

  if (
    !["admin", "superadmin", "cashier", "manager", "staff"].includes(newRole)
  ) {
    throw new Error("Invalid role specified");
  }

  // Only superadmin can assign superadmin role
  if (newRole === "superadmin" && requesterRole !== "superadmin") {
    throw new Error("Only superadmin can assign superadmin role");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent modifying protected user
  if (user.email === "codewithmunyao@gmail.com") {
    throw new Error("This user's role cannot be modified");
  }

  user.role = newRole;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};

// Assign store to user
const assignStoreToUser = async (userId, storeId, permissions = {}) => {
  if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid user ID format");
  }

  if (!storeId || !storeId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid store ID format");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // If user already has this store in permissions, update it
  const existingPermissionIndex = user.storePermissions.findIndex(
    (perm) => perm.store && perm.store.toString() === storeId,
  );

  if (existingPermissionIndex > -1) {
    // Update existing permission
    user.storePermissions[existingPermissionIndex] = {
      store: storeId,
      canView: permissions.canView !== undefined ? permissions.canView : true,
      canEdit: permissions.canEdit !== undefined ? permissions.canEdit : false,
      canSell: permissions.canSell !== undefined ? permissions.canSell : false,
      canManage:
        permissions.canManage !== undefined ? permissions.canManage : false,
    };
  } else {
    // Add new permission
    user.storePermissions.push({
      store: storeId,
      canView: permissions.canView !== undefined ? permissions.canView : true,
      canEdit: permissions.canEdit !== undefined ? permissions.canEdit : false,
      canSell: permissions.canSell !== undefined ? permissions.canSell : false,
      canManage:
        permissions.canManage !== undefined ? permissions.canManage : false,
    });
  }

  await user.save();

  return await getUserWithPermissions(userId);
};

// Remove store from user
const removeStoreFromUser = async (userId, storeId) => {
  if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid user ID format");
  }

  if (!storeId || !storeId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid store ID format");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Remove from storePermissions
  user.storePermissions = user.storePermissions.filter(
    (perm) => !perm.store || perm.store.toString() !== storeId,
  );

  // Remove from storeRoles
  user.storeRoles = user.storeRoles.filter(
    (role) => !role.store || role.store.toString() !== storeId,
  );

  // If this was the assigned store, clear it
  if (user.assignedStore && user.assignedStore.toString() === storeId) {
    user.assignedStore = null;
  }

  await user.save();

  return await getUserWithPermissions(userId);
};

// Set user's primary store
const setPrimaryStore = async (userId, storeId) => {
  if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid user ID format");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (storeId) {
    if (!storeId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid store ID format");
    }

    // Check if user has access to this store
    if (!user.canAccessStore(storeId)) {
      throw new Error("User does not have access to this store");
    }

    user.assignedStore = storeId;
  } else {
    user.assignedStore = null;
  }

  await user.save();

  return await getUserWithPermissions(userId);
};

// Suspend user (admin / superadmin)
const suspendUser = async (userId, adminId, reason = "") => {
  if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid user ID format");
  }

  if (!adminId || !adminId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid admin ID format");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Protect superadmin from being suspended
  if (user.role === "superadmin") {
    throw new Error("Superadmin account cannot be suspended");
  }

  if (user.isSuspended) {
    throw new Error("User is already suspended");
  }

  user.isSuspended = true;
  user.suspendedAt = new Date();
  user.suspensionReason = reason;
  user.suspendedBy = adminId;

  await user.save();

  const response = user.toObject();
  delete response.password;

  return {
    success: true,
    message: "User suspended successfully",
    user: response,
  };
};

// Unsuspend user (admin / superadmin)
const unsuspendUser = async (userId) => {
  if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid user ID format");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isSuspended) {
    throw new Error("User is not suspended");
  }

  user.isSuspended = false;
  user.suspendedAt = null;
  user.suspensionReason = "";
  user.suspendedBy = null;

  await user.save();

  const response = user.toObject();
  delete response.password;

  return {
    success: true,
    message: "User unsuspended successfully",
    user: response,
  };
};

// Delete user by ID - IMPROVED VERSION
const deleteAdminById = async (id) => {
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid user ID format");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  if (
    user.email === "superadmin@example.com" 
  ) {
    throw new Error("This user account cannot be deleted");
  }

  const deletedUser = await User.findByIdAndDelete(id);

  return {
    success: true,
    message: "User deleted successfully",
    userId: deletedUser._id,
    email: deletedUser.email,
  };
};

// Get user's store permissions
const getUserStorePermissions = async (userId, storeId) => {
  if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid user ID format");
  }

  if (!storeId || !storeId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid store ID format");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user.getStorePermissions(storeId);
};

// Get user's accessible stores
// Get user's accessible stores
const getUserAccessibleStores = async (userId) => {
  // Convert userId to string if it's an ObjectId
  const userIdStr = userId.toString ? userId.toString() : userId;

  if (!userIdStr || !userIdStr.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error(`Invalid user ID format: ${userIdStr}`);
  }

  const user = await User.findById(userIdStr);
  if (!user) {
    throw new Error("User not found");
  }

  return await user.getAccessibleStores();
};
// ============ EXISTING FUNCTIONS (slightly improved) ============

const getAllUsers = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    role = "",
    sortBy = "-createdAt",
    newsletter,
    storeId, // New filter: filter by store assignment
  } = options;

  const query = {};

  // Search across multiple fields
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by role
  if (role && role !== "all") {
    query.role = role;
  }

  // Filter by newsletter subscription
  if (newsletter !== undefined) {
    query.newsletter = newsletter === "true";
  }

  // Filter by store assignment
  if (storeId) {
    query.$or = [
      { assignedStore: storeId },
      { "storePermissions.store": storeId },
      { "storeRoles.store": storeId },
    ];
  }

  const skip = (page - 1) * limit;

  const sort = {};
  if (sortBy.startsWith("-")) {
    sort[sortBy.substring(1)] = -1;
  } else {
    sort[sortBy] = 1;
  }

  const users = await User.find(query)
    .select("-password")
    .populate("assignedStore", "name")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit: parseInt(limit),
      },
    },
  };
};

const getUserStats = async () => {
  const totalUsers = await User.countDocuments();
  const adminUsers = await User.countDocuments({ role: "admin" });
  const superAdminUsers = await User.countDocuments({ role: "superadmin" });
  const cashiers = await User.countDocuments({ role: "cashier" });
  const staffs = await User.countDocuments({ role: "staff" });
  const managerUsers = await User.countDocuments({ role: "manager" });
  const newsletterSubscribers = await User.countDocuments({
    newsletter: true,
  });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: oneWeekAgo },
  });

  // Store-related stats
  const usersWithStores = await User.countDocuments({
    $or: [
      { assignedStore: { $ne: null } },
      { storePermissions: { $exists: true, $ne: [] } },
    ],
  });

  return {
    success: true,
    data: {
      totalUsers,
      adminUsers,
      superAdminUsers,
      cashiers,
      staffs,
      managerUsers,
      newsletterSubscribers,
      recentUsers,
      usersWithStores,
    },
  };
};

const fetchAllAdmins = async (options = {}) => {
  const { page = 1, limit = 10, search = "", sortBy = "-createdAt" } = options;

  const query = { role: { $in: ["admin", "superadmin"] } };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const sort = {};
  if (sortBy.startsWith("-")) {
    sort[sortBy.substring(1)] = -1;
  } else {
    sort[sortBy] = 1;
  }

  const admins = await User.find(query)
    .select("-password")
    .populate("assignedStore", "name")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const totalAdmins = await User.countDocuments(query);
  const totalPages = Math.ceil(totalAdmins / limit);

  return {
    success: true,
    data: {
      admins,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalAdmins,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit: parseInt(limit),
      },
    },
  };
};

const findAdminByEmail = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select("-password")
    .populate("assignedStore", "name");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

module.exports = {
  // Keep original functions unchanged
  registerUser,
  loginAdmin,

  // Improved and new functions
  fetchAdminById,
  deleteAdminById,
  getAllUsers,
  getUserStats,
  fetchAllAdmins,
  findAdminByEmail,

  // New store-related functions
  getUserWithPermissions,
  updateUserProfile,
  changePassword,
  updateUserRole,
  assignStoreToUser,
  removeStoreFromUser,
  setPrimaryStore,
  getUserStorePermissions,
  getUserAccessibleStores,
  suspendUser,
  unsuspendUser,
};
