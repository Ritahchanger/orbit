const mongoose = require("mongoose");
const Store = require("../stores/store.model");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
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
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: false,
      index: true,
    },
    phoneNo: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]+$/, "Please enter a valid phone number"],
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
    // ============ STORE FIELDS ADDED HERE ============
    assignedStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    canAccessAllStores: {
      type: Boolean,
      default: function () {
        // Superadmin can access all stores by default
        return this.role === "superadmin";
      },
    },

    storePermissions: [
      {
        store: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
        },
        canView: { type: Boolean, default: true },
        canEdit: { type: Boolean, default: false },
        canSell: { type: Boolean, default: false },
        canManage: { type: Boolean, default: false },
      },
    ],
    // Optional: Store-specific role (if user has different roles in different stores)
    storeRoles: [
      {
        store: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
        },
        role: {
          type: String,
          enum: ["manager", "cashier", "staff"],
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },

    suspendedAt: {
      type: Date,
      default: null,
    },

    suspensionReason: {
      type: String,
      trim: true,
      default: "",
    },

    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
// Add store indexes
UserSchema.index({ assignedStore: 1 });
UserSchema.index({ "storePermissions.store": 1 });
UserSchema.index({ "storeRoles.store": 1 });

UserSchema.index({ email: 1, role: 1 });
UserSchema.index({ "storePermissions.store": 1, role: 1 });
UserSchema.index({ canAccessAllStores: 1, role: 1 });
UserSchema.index({ isActive: 1, role: 1 });
UserSchema.index({ assignedStore: 1, isActive: 1 });
UserSchema.index({ email: 1, isActive: 1 });

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook to auto-populate roleRef
UserSchema.pre("save", async function (next) {
  if (this.isModified("role") && !this.roleRef) {
    try {
      const Role = mongoose.model("Role");
      const roleDoc = await Role.findOne({ name: this.role });
      if (roleDoc) {
        this.roleRef = roleDoc._id;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// ============ USER METHODS ============

UserSchema.methods.canAccessStore = function (storeId) {
  // Superadmin can access all stores
  if (this.role === "superadmin" || this.canAccessAllStores) {
    return true;
  }

  // Check if assigned to this store
  if (
    this.assignedStore &&
    this.assignedStore._id.toString() === storeId.toString()
  ) {
    return true;
  }

  // Check store permissions
  const storePermission = this.storePermissions?.find(
    (perm) => perm.store && perm.store._id.toString() === storeId.toString(),
  );

  return !!storePermission;
};

// Get role-based permissions
// Replace getRolePermissions method:
UserSchema.methods.getRolePermissions = async function () {
  if (!this.role) return [];

  const Role = mongoose.model("Role");
  const role = await Role.findOne({ name: this.role }).select("permissions");
  return role ? role.permissions : [];
};

// Check if user has a specific permission
UserSchema.methods.hasPermission = async function (
  permissionKey,
  storeId = null,
) {
  // Superadmin has all permissions
  if (this.role === "superadmin") return true;

  // Get all permissions
  const allPermissions = await this.getAllPermissions();

  // Check if permission exists in the list
  return allPermissions.includes(permissionKey);
};

// Replace the getAllPermissions method in your User model with this:
UserSchema.methods.getAllPermissions = async function () {
  const user = this;
  let permissions = [];

  // Get role permissions using role name
  if (user.role) {
    const Role = mongoose.model("Role");
    const role = await Role.findOne({ name: user.role }).select("permissions");
    if (role && role.permissions) {
      permissions = [...role.permissions];
    }
  }

  // Check if user has user-specific permissions field
  if (user.permissions && Array.isArray(user.permissions)) {
    permissions = [...permissions, ...user.permissions];
  }

  // Remove duplicates
  return [...new Set(permissions)];
};

// Get user's primary store
UserSchema.methods.getPrimaryStore = function () {
  return this.assignedStore;
};

// Get store-specific permissions
UserSchema.methods.getStorePermissions = function (storeId) {
  // Superadmin gets full permissions
  if (this.role === "superadmin") {
    return {
      canView: true,
      canEdit: true,
      canSell: true,
      canManage: true,
    };
  }

  // Check if user can access all stores
  if (this.canAccessAllStores) {
    return {
      canView: true,
      canEdit: true,
      canSell: true,
      canManage: false, // Can't manage unless explicitly given permission
    };
  }

  // Convert storeId to string for comparison
  const storeIdStr = storeId.toString ? storeId.toString() : storeId;

  // Check assigned store
  if (this.assignedStore) {
    const assignedStoreId = this.assignedStore._id
      ? this.assignedStore._id.toString()
      : this.assignedStore.toString();

    if (assignedStoreId === storeIdStr) {
      // Default permissions for assigned store
      return {
        canView: true,
        canEdit: this.role === "admin", // Admins can edit by default
        canSell: true, // Can sell in assigned store
        canManage: this.role === "admin", // Admins can manage assigned store
      };
    }
  }

  // Check store permissions array
  const storePermission = this.storePermissions?.find((perm) => {
    if (!perm.store) return false;
    const permStoreId = perm.store._id
      ? perm.store._id.toString()
      : perm.store.toString();
    return permStoreId === storeIdStr;
  });

  // Return found permissions or default no permissions
  return (
    storePermission || {
      canView: false,
      canEdit: false,
      canSell: false,
      canManage: false,
    }
  );
};

// Get all stores user can access
UserSchema.methods.getAccessibleStores = async function () {
  if (this.canAccessAllStores || this.role === "superadmin") {
    return await Store.find({ status: "active" });
  }

  const storeIds = [];

  if (this.assignedStore) {
    storeIds.push(this.assignedStore);
  }

  this.storePermissions.forEach((perm) => {
    storeIds.push(perm.store);
  });

  // Remove duplicates
  const uniqueStoreIds = [...new Set(storeIds.map((id) => id.toString()))];

  return await Store.find({
    _id: { $in: uniqueStoreIds },
    status: "active",
  });
};

// Check if user can assign a specific role
UserSchema.methods.canAssignRole = async function (targetRoleName) {
  const Role = mongoose.model("Role");
  const [userRole, targetRole] = await Promise.all([
    Role.findOne({ name: this.role }),
    Role.findOne({ name: targetRoleName }),
  ]);

  if (!userRole || !targetRole) return false;

  // Can only assign roles at or below your level
  return userRole.level > targetRole.level && userRole.canAssign;
};

// ============ STATIC METHODS ============

// Find active users
UserSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

// Find users by role
UserSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

// Find users by store
UserSchema.statics.findByStore = function (storeId) {
  return this.find({
    isActive: true,
    $or: [
      { assignedStore: storeId },
      { canAccessAllStores: true },
      { "storePermissions.store": storeId },
    ],
  });
};

// Find admin users (superadmin, admin, manager)
UserSchema.statics.findAdmins = function () {
  return this.find({
    isActive: true,
    role: { $in: ["superadmin", "admin", "manager"] },
  });
};

module.exports = mongoose.model("User", UserSchema);
