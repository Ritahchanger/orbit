// middlewares/business-access.middleware.js

/**
 * Restricts /business/:id routes to the caller's own business. Platform
 * admins may act on any business. Pass `roles` to also require one of those
 * roles within the business, e.g. businessAccess({ roles: ["admin", "superadmin"] }).
 * Must be used AFTER tokenValidator middleware.
 */
const businessAccess = ({ roles } = {}) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role === "platform_admin") return next();

  if (String(req.businessId) !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access your own business",
    });
  }

  if (roles && !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required",
    });
  }

  next();
};

module.exports = businessAccess;
