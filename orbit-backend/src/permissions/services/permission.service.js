// services/permission.service.js
const UserPermission = require("../models/user-permission.model");

const User = require("../../user/user.model");

const Permission = require("../models/permission.model");

const Role = require("../models/role.model");

async function resolveUserPermissions(userId) {
    const permissions = await UserPermission.find({ user: userId });

    return permissions.map(p => ({
        key: p.permission,
        scope: p.scope,
        store: p.store?.toString() || null
    }));
}

async function hasPermission(user, permission, options = {}) {
    // Superadmin override
    if (user.role === "superadmin") return true;

    const { storeId } = options;

    return await UserPermission.exists({
        user: user._id,
        permission,
        ...(storeId
            ? { scope: "store", store: storeId }
            : { scope: "global" })
    });
}

/**
 * Get all registered permissions
 */
async function getAllPermissions() {
    return await Permission.find({});
}

/**
 * Get a user's assigned permissions
 */
// src/permissions/services/permission.service.js
async function getUserPermissions(userId) {
    // 1. Get user
    const user = await User.findById(userId).lean();

    if (!user) {
        throw new Error("User not found");
    }

    // 2. Get role permissions based on role name (not roleRef)
    let rolePermissions = [];
    if (user.role) {
        const role = await Role.findOne({ name: user.role }).lean();
        if (role) {
            rolePermissions = role.permissions || [];
        }
    }

    // 3. Get user-specific permissions
    const userSpecificPermissions = await UserPermission.find({ user: userId })
        .populate("store", "name code")
        .lean();

    // 4. Transform user-specific permissions to match structure
    const transformedUserPermissions = userSpecificPermissions.map(perm => ({
        _id: perm._id,
        permission: perm.permission,
        scope: perm.scope,
        store: perm.store,
        source: 'user',
        createdAt: perm.createdAt
    }));

    // 5. Transform role permissions to match structure
    const transformedRolePermissions = rolePermissions.map(permissionKey => ({
        permission: permissionKey,
        scope: 'global',
        store: null,
        source: 'role'
    }));

    // 6. Combine all permissions
    const allPermissions = [
        ...transformedRolePermissions,
        ...transformedUserPermissions
    ];

    // 7. Remove duplicates (user permissions override role permissions)
    const uniquePermissions = [];
    const seenPermissions = new Set();

    allPermissions.forEach(perm => {
        // Create a unique key for permission + scope + store
        let key = `${perm.permission}:${perm.scope}`;
        if (perm.store) {
            key += `:${perm.store._id || perm.store}`;
        }

        if (!seenPermissions.has(key)) {
            seenPermissions.add(key);
            uniquePermissions.push(perm);
        }
    });

    return {
        user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            assignedStore: user.assignedStore,
            canAccessAllStores: user.canAccessAllStores
        },
        permissions: uniquePermissions,
        summary: {
            total: uniquePermissions.length,
            fromRole: transformedRolePermissions.length,
            fromUser: transformedUserPermissions.length,
            withStoreScope: uniquePermissions.filter(p => p.scope === 'store').length,
            withGlobalScope: uniquePermissions.filter(p => p.scope === 'global').length
        }
    };
}

/**
 * Assign a permission to a user
 * scope: "global" or "store"
 */
async function assignPermissionToUser({ userId, permission, scope = "global", storeId = null }) {
    const exists = await UserPermission.exists({
        user: userId,
        permission,
        ...(scope === "store" ? { scope, store: storeId } : { scope: "global" })
    });

    if (exists) throw new Error("User already has this permission");
    return await UserPermission.create({
        user: userId,
        permission,
        scope,
        store: storeId || null
    });
}

/**
 * Revoke a permission from a user
 */
async function revokePermissionFromUser({ userId, permission, scope = "global", storeId = null }) {
    const deleted = await UserPermission.findOneAndDelete({
        user: userId,
        permission,
        ...(scope === "store" ? { scope, store: storeId } : { scope: "global" })
    });
    if (!deleted) throw new Error("Permission not found for this user");
    return deleted;
}


module.exports = {
    resolveUserPermissions,
    hasPermission,
    getAllPermissions,
    getUserPermissions,
    assignPermissionToUser,
    revokePermissionFromUser
};
