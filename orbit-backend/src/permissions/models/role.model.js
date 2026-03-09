// models/role.model.js
const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Role name is required"],
        unique: true,
        trim: true,
        lowercase: true,
        enum: ["superadmin", "admin", "manager", "cashier", "staff"]
    },
    description: {
        type: String,
        default: ""
    },
    permissions: [{
        type: String // Store permission keys (e.g., "products.view")
    }],
    isSystemRole: {
        type: Boolean,
        default: false
    },
    canAssign: {
        type: Boolean,
        default: false
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
RoleSchema.index({ name: 1 });
RoleSchema.index({ level: -1 });
RoleSchema.index({ isSystemRole: 1 });

// Virtual for formatted name
RoleSchema.virtual("displayName").get(function () {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
});

// Static method to get default roles
RoleSchema.statics.getDefaultRoles = function () {
    return {
        superadmin: {
            name: "superadmin",
            description: "Full system access with all permissions",
            isSystemRole: true,
            canAssign: true,
            level: 10
        },
        admin: {
            name: "admin",
            description: "Administrator with management permissions",
            isSystemRole: true,
            canAssign: true,
            level: 9
        },
        manager: {
            name: "manager",
            description: "Store manager with sales and inventory access",
            isSystemRole: true,
            canAssign: false,
            level: 7
        },
        cashier: {
            name: "cashier",
            description: "Cashier with basic sales permissions",
            isSystemRole: true,
            canAssign: false,
            level: 5
        },
        staff: {
            name: "staff",
            description: "General staff member",
            isSystemRole: true,
            canAssign: false,
            level: 4
        },
       
    };
};

// Instance method to check permission
RoleSchema.methods.hasPermission = function (permissionKey) {
    // Superadmin has all permissions implicitly
    if (this.name === "superadmin") return true;

    // Check if permission exists in role's permissions array
    return this.permissions.includes(permissionKey);
};

// Instance method to add permission
RoleSchema.methods.addPermission = function (permissionKey) {
    if (!this.permissions.includes(permissionKey)) {
        this.permissions.push(permissionKey);
    }
    return this;
};

// Instance method to remove permission
RoleSchema.methods.removePermission = function (permissionKey) {
    const index = this.permissions.indexOf(permissionKey);
    if (index > -1) {
        this.permissions.splice(index, 1);
    }
    return this;
};

module.exports = mongoose.model("Role", RoleSchema);