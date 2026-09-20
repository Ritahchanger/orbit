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

/**
 * Bulk update a role's permissions
 * (relocated from routes/role.routes.js — behavior unchanged)
 */
async function bulkUpdateRolePermissions(req, res) {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
            success: false,
            message: "Permissions array is required",
        });
    }

    // First validate all permissions
    await roleService.validatePermissions(permissions);

    // Update role with new permissions
    const role = await roleService.updateRole(id, { permissions });

    return res.status(200).json({
        success: true,
        message: "Role permissions updated successfully",
        data: role,
    });
}

/**
 * Clone an existing role under a new name
 * (relocated from routes/role.routes.js — behavior unchanged)
 */
async function cloneRole(req, res) {
    const { id } = req.params;
    const { name: newRoleName, description: newDescription } = req.body;

    if (!newRoleName) {
        return res.status(400).json({
            success: false,
            message: "New role name is required",
        });
    }

    // Get existing role
    const existingRole = await roleService.getRoleById(id);

    // Create new role with same permissions
    const newRole = await roleService.createRole({
        name: newRoleName,
        description: newDescription || `Cloned from ${existingRole.displayName}`,
        permissions: existingRole.permissions,
        level: existingRole.level,
        canAssign: existingRole.canAssign,
    });

    return res.status(201).json({
        success: true,
        message: "Role cloned successfully",
        data: newRole,
    });
}

/**
 * Export all roles to JSON
 * (relocated from routes/role.routes.js — behavior unchanged)
 */
async function exportRoles(req, res) {
    const roles = await roleService.getAllRoles({ includeSystemRoles: true });

    // Set headers for file download
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=roles-export.json",
    );

    return res.json({
        success: true,
        timestamp: new Date().toISOString(),
        count: roles.length,
        data: roles,
    });
}

/**
 * Import roles from JSON
 * (relocated from routes/role.routes.js. Uses findRoleByName() — a
 * non-throwing lookup — instead of getRoleByName(), which threw on a miss
 * and made the "create new role" branch below unreachable.)
 */
async function importRoles(req, res) {
    const { roles } = req.body;

    if (!roles || !Array.isArray(roles)) {
        return res.status(400).json({
            success: false,
            message: "Roles array is required",
        });
    }

    const results = [];

    for (const roleData of roles) {
        try {
            // Check if role already exists (non-throwing lookup — getRoleByName
            // throws on a miss, which made the "create new role" branch below
            // unreachable; every not-yet-existing role landed in the "failed"
            // bucket instead of being created)
            const existingRole = await roleService.findRoleByName(
                roleData.name.toLowerCase(),
            );

            if (existingRole) {
                // Update existing role
                const updatedRole = await roleService.updateRole(
                    existingRole._id,
                    roleData,
                );
                results.push({
                    name: roleData.name,
                    action: "updated",
                    status: "success",
                    data: updatedRole,
                });
            } else {
                // Create new role
                const newRole = await roleService.createRole(roleData);
                results.push({
                    name: roleData.name,
                    action: "created",
                    status: "success",
                    data: newRole,
                });
            }
        } catch (error) {
            results.push({
                name: roleData.name,
                action: "failed",
                status: "error",
                error: error.message,
            });
        }
    }

    return res.status(200).json({
        success: true,
        message: "Roles import completed",
        results: results,
        summary: {
            total: roles.length,
            success: results.filter((r) => r.status === "success").length,
            failed: results.filter((r) => r.status === "error").length,
        },
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
    validatePermissions,
    bulkUpdateRolePermissions,
    cloneRole,
    exportRoles,
    importRoles
};