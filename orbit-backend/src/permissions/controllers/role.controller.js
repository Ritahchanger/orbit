// controllers/role.controller.js
const roleService = require("../services/role.services");

/**
 * Get all roles
 */
async function getRoles(req, res) {
    const options = {
        includeSystemRoles: req.query.includeSystemRoles !== 'false',
        sortBy: req.query.sortBy || 'level',
        sortOrder: req.query.sortOrder || 'desc'
    };

    const roles = await roleService.getAllRoles(options);

    return res.status(200).json({
        success: true,
        data: roles,
        count: roles.length
    });
}

/**
 * Get role by ID
 */
async function getRoleById(req, res) {
    const { id } = req.params;

    const role = await roleService.getRoleById(id);

    return res.status(200).json({
        success: true,
        data: role
    });
}

/**
 * Get role by name
 */
async function getRoleByName(req, res) {
    const { name } = req.params;

    const role = await roleService.getRoleByName(name);

    return res.status(200).json({
        success: true,
        data: role
    });
}

/**
 * Create new role
 */
async function createRole(req, res) {
    const roleData = req.body;

    const role = await roleService.createRole(roleData);

    return res.status(201).json({
        success: true,
        message: "Role created successfully",
        data: role
    });
}

/**
 * Update existing role
 */
async function updateRole(req, res) {
    const { id } = req.params;
    const updates = req.body;

    const role = await roleService.updateRole(id, updates);

    return res.status(200).json({
        success: true,
        message: "Role updated successfully",
        data: role
    });
}

/**
 * Delete role
 */
async function deleteRole(req, res) {
    const { id } = req.params;

    const result = await roleService.deleteRole(id);

    return res.status(200).json({
        success: true,
        message: result.message
    });
}

/**
 * Add permission to role
 */
async function addPermission(req, res) {
    const { id } = req.params;
    const { permission } = req.body;

    if (!permission) {
        return res.status(400).json({
            success: false,
            message: "Permission key is required"
        });
    }

    const role = await roleService.addPermissionToRole(id, permission);

    return res.status(200).json({
        success: true,
        message: "Permission added to role",
        data: role
    });
}

/**
 * Remove permission from role
 */
async function removePermission(req, res) {
    const { id } = req.params;
    const { permission } = req.body;

    if (!permission) {
        return res.status(400).json({
            success: false,
            message: "Permission key is required"
        });
    }

    const role = await roleService.removePermissionFromRole(id, permission);

    return res.status(200).json({
        success: true,
        message: "Permission removed from role",
        data: role
    });
}

/**
 * Get users assigned to role
 */
async function getRoleUsers(req, res) {
    const { id } = req.params;
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await roleService.getUsersByRole(id, options);

    return res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination
    });
}

/**
 * Check if user has permission
 */
async function checkUserPermission(req, res) {
    const { userId } = req.params;
    const { permission } = req.query;

    if (!permission) {
        return res.status(400).json({
            success: false,
            message: "Permission key is required in query"
        });
    }

    const hasPermission = await roleService.checkUserPermission(userId, permission);

    return res.status(200).json({
        success: true,
        data: {
            hasPermission,
            userId,
            permission
        }
    });
}

/**
 * Get assignable roles
 */
async function getAssignableRoles(req, res) {
    const { roleName } = req.params;

    const assignableRoles = await roleService.getAssignableRoles(roleName);

    return res.status(200).json({
        success: true,
        data: assignableRoles
    });
}

/**
 * Sync role permissions
 */
async function syncPermissions(req, res) {
    const { id } = req.params;

    const result = await roleService.syncRolePermissions(id);

    return res.status(200).json({
        success: true,
        message: "Role permissions synced",
        data: result
    });
}

/**
 * Seed default roles
 */
async function seedDefaultRoles(req, res) {
    const results = await roleService.seedDefaultRoles();

    return res.status(200).json({
        success: true,
        message: "Default roles seeding completed",
        data: results
    });
}

/**
 * Get role statistics
 */
async function getRoleStatistics(req, res) {
    const statistics = await roleService.getRoleStatistics();

    return res.status(200).json({
        success: true,
        data: statistics
    });
}

/**
 * Validate permissions
 */
async function validatePermissions(req, res) {
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
            success: false,
            message: "Permissions array is required"
        });
    }

    const isValid = await roleService.validatePermissions(permissions);

    return res.status(200).json({
        success: true,
        message: "All permissions are valid",
        data: { isValid }
    });
}

module.exports = {
    getRoles,
    getRoleById,
    getRoleByName,
    createRole,
    updateRole,
    deleteRole,
    addPermission,
    removePermission,
    getRoleUsers,
    checkUserPermission,
    getAssignableRoles,
    syncPermissions,
    seedDefaultRoles,
    getRoleStatistics,
    validatePermissions
};