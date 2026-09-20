// middlewares/permissionValidator.js
const { findRoleByName, resolveUserPermissions } = require("../permissions");

const permissionValidator = (requiredPermissions = []) => {
    return async (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            // Only superadmin bypasses permission checks unconditionally
            if (user.role === "superadmin") {
                return next();
            }

            // No restrictions required — allow through
            if (requiredPermissions.length === 0) {
                return next();
            }

            // Fetch the user's role permissions from DB
            const role = await findRoleByName(user.role);
            const rolePermissions = role ? role.permissions : [];

            // Merge in any user-specific permission overrides
            const userSpecific = await resolveUserPermissions(user._id);
            const userSpecificKeys = userSpecific.map(p => p.key);

            const allPermissions = [...new Set([...rolePermissions, ...userSpecificKeys])];

            const hasAll = requiredPermissions.every(perm => allPermissions.includes(perm));

            if (!hasAll) {
                return res.status(403).json({
                    success: false,
                    message: "Insufficient permissions",
                    required: requiredPermissions
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