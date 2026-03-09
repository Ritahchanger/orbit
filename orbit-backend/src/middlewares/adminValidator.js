// middlewares/adminValidator.js

/**
 * Admin Validator Middleware
 * Verifies that the authenticated user has admin or superadmin privileges
 * Must be used AFTER tokenValidator middleware
 */
const adminValidator = (req, res, next) => {
    // Check if user exists (should be set by tokenValidator)
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    // Check if user has admin or superadmin role
    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "superadmin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required"
        });
    }

    // User is authorized, continue to the next middleware/controller
    next();
};

module.exports = adminValidator;