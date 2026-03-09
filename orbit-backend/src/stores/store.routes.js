// routes/store.routes.js - UPDATED
const express = require("express");
const router = express.Router();
const storeController = require("./store.controller");
const tokenValidator = require("../middlewares/tokenValidator");
const {
  storeAccess,
  canManageStore,
} = require("../middlewares/store-access.middleware");
const asyncWrapper = require("../middlewares/asyncMiddleware");

// Apply auth middleware to all routes
router.use(tokenValidator);

// Get all stores (filtered by user's access)
router.get("/", asyncWrapper(storeController.getAllStores));

// Search stores
router.get("/search", asyncWrapper(storeController.searchStores));

// Get store by code
router.get("/code/:code", asyncWrapper(storeController.getStoreByCode));

// Get single store
router.get(
  "/:id",
  storeAccess("id"),
  asyncWrapper(storeController.getStoreById),
);

// Get store statistics
router.get(
  "/:id/stats",
  storeAccess("id"),
  asyncWrapper(storeController.getStoreStats),
);

// Get store users
router.get(
  "/:id/users",
  storeAccess("id"),
  asyncWrapper(storeController.getStoreUsers),
);

router.get(
  "/:id/workers",
//   storeAccess("id"),
  asyncWrapper(storeController.getStoreWorkers),
);

// Get store users (simpler list - for dropdowns, quick references)
router.get(
  "/:id/users",
  storeAccess("id"),
  asyncWrapper(storeController.getStoreUsers),
);

// Create store (superadmin only)
router.post(
  "/",
  (req, res, next) => {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can create stores",
      });
    }
    next();
  },
  asyncWrapper(storeController.createStore),
);

// Delete store (superadmin only)
router.delete(
  "/:id",
  (req, res, next) => {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can delete stores",
      });
    }
    next();
  },
  asyncWrapper(storeController.deleteStore),
);

// Update store (superadmin or store manager)
router.put(
  "/:id",
  canManageStore("params", "id"),
  asyncWrapper(storeController.updateStore),
);

// Assign user to store
router.post(
  "/:id/users/:userId",
  canManageStore("params", "storeId"),
  asyncWrapper(storeController.assignUserToStore),
);

module.exports = router;
