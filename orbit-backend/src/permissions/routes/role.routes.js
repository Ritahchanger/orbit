const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const asyncHandler = require("../../middlewares/asyncMiddleware");
const tokenValidator = require("../../middlewares/tokenValidator");
const permissionValidator = require("../../middlewares/permissionValidator");

const recordAdminLog = require("../../custom-logs/middleware/record-admin.middleware");

// ==================== ROLE MANAGEMENT ROUTES ====================

// Get all roles (requires users.manage permission)
router.get(
  "/",
  tokenValidator,
  permissionValidator(["users.manage"]),

  asyncHandler(roleController.getRoles),
);

// Get role by ID (requires users.manage permission)
router.get(
  "/:id",
  tokenValidator,
  permissionValidator(["users.manage"]),
  asyncHandler(roleController.getRoleById),
);

// Get role by name (requires users.manage permission)
router.get(
  "/name/:name",
  tokenValidator,
  permissionValidator(["users.manage"]),
  asyncHandler(roleController.getRoleByName),
);

// Create new role (requires users.manage permission)
router.post(
  "/",
  tokenValidator,
  permissionValidator(["users.manage"]),
  asyncHandler(roleController.createRole),
);

// Update existing role (requires users.manage permission)
router.put(
  "/:id",
  tokenValidator,
  permissionValidator(["users.manage"]),
  recordAdminLog("CREATE_ROLE"),
  asyncHandler(roleController.updateRole),
);

// Delete role (requires users.manage permission)
router.delete(
  "/:id",
  tokenValidator,
  permissionValidator(["users.manage"]),
  recordAdminLog("DELETE_ROLE"),
  asyncHandler(roleController.deleteRole),
);

// Add permission to role (requires users.manage permission)
router.post(
  "/:id/permissions",
  tokenValidator,
  permissionValidator(["users.manage"]),
  asyncHandler(roleController.addPermission),
);

// Remove permission from role (requires users.manage permission)
router.delete(
  "/:id/permissions",
  tokenValidator,
  permissionValidator(["users.manage"]),
  recordAdminLog("REMOVE_PERMISSION_FROM_ROLE"),
  asyncHandler(roleController.removePermission),
);

// Get users assigned to role (requires users.view permission)
router.get(
  "/:id/users",
  tokenValidator,
  permissionValidator(["users.view"]),
  asyncHandler(roleController.getRoleUsers),
);

// Check if user has permission through role (requires users.view permission)
router.get(
  "/users/:userId/permissions/check",
  tokenValidator,
  permissionValidator(["users.view"]),
  asyncHandler(roleController.checkUserPermission),
);

// Get assignable roles (requires users.view permission)
router.get(
  "/assignable/:roleName",
  tokenValidator,
  permissionValidator(["users.view"]),
  asyncHandler(roleController.getAssignableRoles),
);

// Sync role permissions with available permissions (requires users.manage permission)
router.post(
  "/:id/permissions/sync",
  tokenValidator,
  permissionValidator(["users.manage"]),
  asyncHandler(roleController.syncPermissions),
);

// Seed default roles (requires users.manage permission - superadmin only)
router.post(
  "/seed/default",
  tokenValidator,
  permissionValidator(["users.manage"]),
  recordAdminLog("SEED_DEFAULT_ROLES"),
  asyncHandler(roleController.seedDefaultRoles),
);

// Get role statistics (requires users.view permission)
router.get(
  "/statistics/overview",
  tokenValidator,
  permissionValidator(["users.view"]),
  asyncHandler(roleController.getRoleStatistics),
);

// Validate permissions (requires users.manage permission)
router.post(
  "/permissions/validate",
  tokenValidator,
  permissionValidator(["users.manage"]),
  asyncHandler(roleController.validatePermissions),
);

// Bulk update role permissions (requires users.manage permission)
router.put(
  "/:id/permissions/bulk",
  tokenValidator,
  permissionValidator(["users.manage"]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Permissions array is required",
      });
    }

    // First validate all permissions
    const roleService = require("../services/role.service");
    await roleService.validatePermissions(permissions);

    // Update role with new permissions
    const role = await roleService.updateRole(id, { permissions });

    return res.status(200).json({
      success: true,
      message: "Role permissions updated successfully",
      data: role,
    });
  }),
);

// Clone role (requires users.manage permission)
router.post(
  "/:id/clone",
  tokenValidator,
  permissionValidator(["users.manage"]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name: newRoleName, description: newDescription } = req.body;

    if (!newRoleName) {
      return res.status(400).json({
        success: false,
        message: "New role name is required",
      });
    }

    const roleService = require("../services/role.service");

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
  }),
);

// Export roles to JSON (requires users.manage permission)
router.get(
  "/export/json",
  tokenValidator,
  permissionValidator(["users.manage"]),
  asyncHandler(async (req, res) => {
    const roleService = require("../services/role.service");
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
  }),
);

// Import roles from JSON (requires users.manage permission)
router.post(
  "/import/json",
  tokenValidator,
  permissionValidator(["users.manage"]),
  asyncHandler(async (req, res) => {
    const { roles } = req.body;

    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({
        success: false,
        message: "Roles array is required",
      });
    }

    const roleService = require("../services/role.service");
    const results = [];

    for (const roleData of roles) {
      try {
        // Check if role already exists
        const existingRole = await roleService.getRoleByName(roleData.name);

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
  }),
);

module.exports = router;
