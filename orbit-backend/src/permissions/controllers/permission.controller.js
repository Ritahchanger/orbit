const permissionService = require("../services/permission.service");

const User = require("../../user/user.model");

/**
 * GET /api/permissions
 */
async function getPermissions(req, res) {

    const permissions = await permissionService.getAllPermissions();
    res.status(200).json({ success: true, data: permissions });

}

/**
 * GET /api/users/:userId/permissions
 */
async function getUserPermissions(req, res) {

    const { userId } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    // Get user permissions from service
    const permissions = await permissionService.getUserPermissions(userId);

    return res.status(200).json({
        success: true,
        data: permissions
    });
}


/**
 * POST /api/users/:userId/permissions
 * body: { permission, scope, storeId? }
 */
async function assignPermission(req, res) {

    const { userId } = req.params;
    const { permission, scope, storeId } = req.body;

    const newPermission = await permissionService.assignPermissionToUser({
        userId,
        permission,
        scope,
        storeId
    });

    res.status(201).json({ success: true, data: newPermission });
}

/**
 * DELETE /api/users/:userId/permissions
 * body: { permission, scope, storeId? }
 */
async function revokePermission(req, res) {

    const { userId } = req.params;
    const { permission, scope, storeId } = req.body;

    const removedPermission = await permissionService.revokePermissionFromUser({
        userId,
        permission,
        scope,
        storeId
    });

    res.status(200).json({ success: true, data: removedPermission });

}

module.exports = {
    getPermissions,
    getUserPermissions,
    assignPermission,
    revokePermission
};
