// middlewares/storeAccess.js - UPDATED
const storeAccess = (source = "params", storeIdParam = "storeId") => {
    return async (req, res, next) => {
        try {
            // Get store ID from specified source
            let storeId;

            if (source === "params") {
                storeId = req.params[storeIdParam];
            } else if (source === "query") {
                storeId = req.query[storeIdParam];
            } else if (source === "body") {
                storeId = req.body[storeIdParam];
            } else {
                // Default: try all sources
                storeId = req.params[storeIdParam] || req.query[storeIdParam] || req.body[storeIdParam];
            }

            // If no storeId in request, check if user has a default store
            if (!storeId && req.user.assignedStore) {
                storeId = req.user.assignedStore._id;
            }

            // Skip store check for superadmin
            if (req.user.role === "superadmin" || req.user.canAccessAllStores) {
                req.storeId = storeId;
                return next();
            }

            // For other users, storeId is required
            if (!storeId) {
                return res.status(400).json({
                    success: false,
                    message: "Store ID is required for this operation"
                });
            }

            // Check if user can access this store
            if (!req.user.canAccessStore(storeId)) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to access this store"
                });
            }

            // Store ID is valid and accessible
            req.storeId = storeId;
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Store access validation failed",
                error: error.message
            });
        }
    };
};

// Middleware for store management (more restrictive)
const canManageStore = (source = "params", storeIdParam = "storeId") => {
    return async (req, res, next) => {
        try {
            let storeId;

            if (source === "params") {
                storeId = req.params[storeIdParam];
            } else if (source === "query") {
                storeId = req.query[storeIdParam];
            } else if (source === "body") {
                storeId = req.body[storeIdParam];
            } else {
                storeId = req.params[storeIdParam] || req.query[storeIdParam] || req.body[storeIdParam];
            }

            if (!storeId) {
                return res.status(400).json({
                    success: false,
                    message: "Store ID is required"
                });
            }

            // Superadmin can manage all stores
            if (req.user.role === "superadmin") {
                req.storeId = storeId;
                return next();
            }

            // Check if user has manage permission for this store
            const permissions = req.user.getStorePermissions(storeId);
            if (!permissions.canManage) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to manage this store"
                });
            }

            req.storeId = storeId;
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Store management validation failed",
                error: error.message
            });
        }
    };
};

module.exports = { storeAccess, canManageStore };