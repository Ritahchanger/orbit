// middlewares/platformAdminValidator.js

/**
 * Platform Admin Validator Middleware
 * Lets through only Orbit's own staff (role "platform_admin"), who manage
 * every business on the platform. A business's superadmin is its owner, not
 * a platform admin. Must be used AFTER tokenValidator middleware.
 */
const platformAdminValidator = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.role !== "platform_admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Platform admin privileges required"
        });
    }

    next();
};

module.exports = platformAdminValidator;
