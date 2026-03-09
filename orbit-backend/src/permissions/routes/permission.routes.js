const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permission.controller");
const asyncHandler = require("../../middlewares/asyncMiddleware");
const tokenValidator = require("../../middlewares/tokenValidator");
// ==================== PERMISSIONS ROUTES ====================
// Get all available permissions
router.get(
    "/",
    tokenValidator,
    asyncHandler(permissionController.getPermissions)
);

// Get all permissions of a specific user
router.get(
    "/users/:userId",
    tokenValidator,
    asyncHandler(permissionController.getUserPermissions)
);

// Assign a permission to a user
router.post(
    "/users/:userId",
    tokenValidator,
    asyncHandler(permissionController.assignPermission)
);

// Revoke a permission from a user
router.delete(
    "/users/:userId",
    tokenValidator,
    asyncHandler(permissionController.revokePermission)
);

module.exports = router;
