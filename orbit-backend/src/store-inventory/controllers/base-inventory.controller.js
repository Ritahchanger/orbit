// controllers/inventory/base-inventory.controller.js
class BaseInventoryController {
    /**
     * Handle successful responses
     */
    sendSuccess(res, data, message = "Success", statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date()
        });
    }

    /**
     * Handle error responses
     */
    sendError(res, error, statusCode = 400) {
        console.error(`❌ Controller Error:`, error);
        return res.status(statusCode).json({
            success: false,
            message: error.message || "An error occurred",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date()
        });
    }

    /**
     * Validate required parameters
     */
    validateParams(req, requiredParams) {
        const missing = [];
        requiredParams.forEach(param => {
            if (req.params[param] === undefined) {
                missing.push(param);
            }
        });

        if (missing.length > 0) {
            throw new Error(`Missing required parameters: ${missing.join(', ')}`);
        }
    }

    /**
     * Validate request body
     */
    validateBody(req, requiredFields) {
        const missing = [];
        requiredFields.forEach(field => {
            if (req.body[field] === undefined) {
                missing.push(field);
            }
        });

        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }

    /**
     * Get pagination parameters from request
     */
    getPaginationParams(req) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        return { page, limit, skip };
    }

    /**
     * Get filters from request query
     */
    getFilters(req) {
        const filters = {};
        const filterFields = ['status', 'category', 'search', 'lowStock', 'outOfStock', 'inStock'];

        filterFields.forEach(field => {
            if (req.query[field] !== undefined) {
                filters[field] = req.query[field];
            }
        });

        return filters;
    }

    /**
     * Authenticate user (placeholder - implement your actual auth)
     */
    async authenticateUser(req) {
        // Implement your authentication logic
        if (!req.user) {
            throw new Error("Authentication required");
        }
        return req.user;
    }
}

module.exports = BaseInventoryController;