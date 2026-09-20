const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const asyncHandler = require("../../middlewares/asyncMiddleware");
const tokenValidator = require("../../middlewares/refreshTokenValidator");
const permissionValidator = require("../../middlewares/permissionValidator");

const recordAdminLog = require("../../custom-logs/middleware/record-admin.middleware");

// ==================== ROLE MANAGEMENT ROUTES ====================

// Get all roles
router.get(
  "/",
  tokenValidator,
  permissionValidator(["roles.view"]),
  asyncHandler(roleController.getRoles),
);

// Get role by ID
router.get(
  "/:id",
  tokenValidator,
  permissionValidator(["roles.view"]),
  asyncHandler(roleController.getRoleById),
);

// Get role by name
router.get(
  "/name/:name",
  tokenValidator,
  permissionValidator(["roles.view"]),
  asyncHandler(roleController.getRoleByName),
);

// Create new role
router.post(
  "/",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  asyncHandler(roleController.createRole),
);

// Update existing role
router.put(
  "/:id",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  recordAdminLog("CREATE_ROLE"),
  asyncHandler(roleController.updateRole),
);

// Delete role
router.delete(
  "/:id",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  recordAdminLog("DELETE_ROLE"),
  asyncHandler(roleController.deleteRole),
);

// Add permission to role
router.post(
  "/:id/permissions",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  asyncHandler(roleController.addPermission),
);

// Remove permission from role
router.delete(
  "/:id/permissions",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  recordAdminLog("REMOVE_PERMISSION_FROM_ROLE"),
  asyncHandler(roleController.removePermission),
);

// Get users assigned to role
router.get(
  "/:id/users",
  tokenValidator,
  permissionValidator(["users.view"]),
  asyncHandler(roleController.getRoleUsers),
);

// Check if user has permission through role
router.get(
  "/users/:userId/permissions/check",
  tokenValidator,
  permissionValidator(["users.view"]),
  asyncHandler(roleController.checkUserPermission),
);

// Get assignable roles
router.get(
  "/assignable/:roleName",
  tokenValidator,
  permissionValidator(["users.view"]),
  asyncHandler(roleController.getAssignableRoles),
);

// Sync role permissions with available permissions
router.post(
  "/:id/permissions/sync",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  asyncHandler(roleController.syncPermissions),
);

// Seed default roles (superadmin only via permissions.manage)
router.post(
  "/seed/default",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  recordAdminLog("SEED_DEFAULT_ROLES"),
  asyncHandler(roleController.seedDefaultRoles),
);

// Get role statistics
router.get(
  "/statistics/overview",
  tokenValidator,
  permissionValidator(["users.view"]),
  asyncHandler(roleController.getRoleStatistics),
);

// Validate permissions
router.post(
  "/permissions/validate",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  asyncHandler(roleController.validatePermissions),
);

// Bulk update role permissions (requires users.manage permission)
router.put(
  "/:id/permissions/bulk",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  asyncHandler(roleController.bulkUpdateRolePermissions),
);

// Clone role (requires users.manage permission)
router.post(
  "/:id/clone",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  asyncHandler(roleController.cloneRole),
);

// Export roles to JSON (requires users.manage permission)
router.get(
  "/export/json",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  asyncHandler(roleController.exportRoles),
);

// Import roles from JSON (requires users.manage permission)
router.post(
  "/import/json",
  tokenValidator,
  permissionValidator(["permissions.manage"]),
  asyncHandler(roleController.importRoles),
);

module.exports = router;
