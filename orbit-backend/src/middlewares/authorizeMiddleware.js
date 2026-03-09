// middlewares/authorize.js
const mongoose = require("mongoose");
const authorize = (requiredPermissions = [], options = {}) => {
  const { checkStoreAccess = false, requireAll = true } = options;
  return async (req, res, next) => {
    try {
      const user = req.user;
      const storeId =
        req.params.storeId || req.body.storeId || req.query.storeId;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. User not found.",
        });
      }
      // Superadmin bypass
      if (user.role === "superadmin") {
        return next();
      }
      // Check store access if required
      if (checkStoreAccess && storeId) {
        const canAccess = user.canAccessStore(storeId);
        if (!canAccess) {
          return res.status(403).json({
            success: false,
            message: "You don't have access to this store.",
          });
        }
      }
      // If no permissions required, proceed
      if (requiredPermissions.length === 0) {
        return next();
      }
      // Get role permissions
      const Role = mongoose.model("Role");
      const userRole = await Role.findOne({ name: user.role });
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: "User role not found.",
        });
      }
      const userPermissions = userRole.permissions || [];
      // Check permissions
      let hasRequiredPermissions;
      if (requireAll) {
        // User must have ALL required permissions
        hasRequiredPermissions = requiredPermissions.every((permission) =>
          userPermissions.includes(permission),
        );
      } else {
        // User must have AT LEAST ONE of the required permissions
        hasRequiredPermissions = requiredPermissions.some((permission) =>
          userPermissions.includes(permission),
        );
      }
      if (!hasRequiredPermissions) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions.",
          required: requiredPermissions,
          requiredMode: requireAll ? "all" : "any",
        });
      }
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization failed",
        error: error.message,
      });
    }
  };
};

module.exports = authorize;
