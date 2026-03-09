// middlewares/permissionValidator.js
const { resolveUserPermissions } = require("../permissions/services/permission.service");

const permissionValidator = (requiredPermissions = []) => {
    return async (req, res, next) => {
        try {
            // Get user from request (set by tokenValidator)
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            // Superadmin has all permissions
            if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'manager' || user.role === 'cashier' || user.role === 'staff') {
                return next();
            }


            // Get user's permissions
            const userPermissions = await resolveUserPermissions(user._id);
            const permissionKeys = userPermissions.map(p => p.key);

            // Check if user has all required permissions
            const hasAllPermissions = requiredPermissions.every(perm =>
                permissionKeys.includes(perm)
            );

            if (!hasAllPermissions) {
                return res.status(403).json({
                    success: false,
                    message: "Insufficient permissions",
                    required: requiredPermissions,
                    has: permissionKeys
                });
            }

            next();
        } catch (error) {
            console.error("Permission validation error:", error);
            return res.status(500).json({
                success: false,
                message: "Permission validation failed"
            });
        }
    };
};

module.exports = permissionValidator;