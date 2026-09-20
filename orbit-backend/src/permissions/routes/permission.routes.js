const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permission.controller");
const asyncHandler = require("../../middlewares/asyncMiddleware");
const tokenValidator = require("../../middlewares/refreshTokenValidator");
const permissionValidator = require("../../middlewares/permissionValidator");

// ==================== PERMISSIONS ROUTES ====================

// Get all available permissions
router.get(
    "/",
    tokenValidator,
    permissionValidator(["roles.view"]),
    asyncHandler(permissionController.getPermissions)
);

// Get all permissions of a specific user
router.get(
    "/users/:userId",
    tokenValidator,
    permissionValidator(["roles.view"]),
    asyncHandler(permissionController.getUserPermissions)
);

// Assign a permission to a user
router.post(
    "/users/:userId",
    tokenValidator,
    permissionValidator(["permissions.manage"]),
    asyncHandler(permissionController.assignPermission)
);

// Revoke a permission from a user
router.delete(
    "/users/:userId",
    tokenValidator,
    permissionValidator(["permissions.manage"]),
    asyncHandler(permissionController.revokePermission)
);

module.exports = router;
