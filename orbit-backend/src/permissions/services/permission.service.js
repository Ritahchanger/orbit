// services/permission.service.js
const userPermissionRepository = require("../repositories/user-permission.repository");
const permissionRepository = require("../repositories/permission.repository");
const roleRepository = require("../repositories/role.repository");
const userReadRepository = require("../repositories/user-read.repository");

async function resolveUserPermissions(userId) {
    const permissions = await userPermissionRepository.findByUser(userId);

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

    return await userPermissionRepository.exists({
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
    return await permissionRepository.findAll();
}

/**
 * Get a user's assigned permissions.
 * Returns null if the user doesn't exist or doesn't belong to businessId
 * (caller — permission.controller.js — returns 404 in that case).
 */
async function getUserPermissions(userId, businessId) {
    // 1. Get user, scoped to the requester's business
    const user = businessId !== undefined
        ? await userReadRepository.findByIdAndBusiness(userId, businessId)
        : await userReadRepository.findByIdLean(userId);

    if (!user) {
        return null;
    }

    // 2. Get role permissions based on role name (not roleRef)
    let rolePermissions = [];
    if (user.role) {
        const role = await roleRepository.findByName(user.role);
        if (role) {
            rolePermissions = role.permissions || [];
        }
    }

    // 3. Get user-specific permissions
    const userSpecificPermissions = await userPermissionRepository.findByUserPopulated(userId);

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
 * Returns null if the target user doesn't belong to businessId.
 */
async function assignPermissionToUser({ userId, permission, scope = "global", storeId = null, businessId }) {
    if (businessId !== undefined) {
        const user = await userReadRepository.findByIdAndBusiness(userId, businessId);
        if (!user) return null;
    }

    const exists = await userPermissionRepository.exists({
        user: userId,
        permission,
        ...(scope === "store" ? { scope, store: storeId } : { scope: "global" })
    });

    if (exists) throw new Error("User already has this permission");
    return await userPermissionRepository.create({
        user: userId,
        permission,
        scope,
        store: storeId || null
    });
}

/**
 * Revoke a permission from a user
 * Returns null if the target user doesn't belong to businessId.
 */
async function revokePermissionFromUser({ userId, permission, scope = "global", storeId = null, businessId }) {
    if (businessId !== undefined) {
        const user = await userReadRepository.findByIdAndBusiness(userId, businessId);
        if (!user) return null;
    }

    const deleted = await userPermissionRepository.findOneAndDelete({
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
