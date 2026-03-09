const Router = require("express").Router();
const userController = require("./user.controller");
const asyncWrapper = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const adminValidator = require("../middlewares/adminValidator");

// ============ PUBLIC ROUTES ============
Router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});
// ============ PROTECTED ROUTES (Require Authentication) ============

// User profile & self-management
Router.get(
  "/me",
  tokenValidator,
  asyncWrapper(userController.getUserWithPermissions),
);

Router.put(
  "/me",
  tokenValidator,
  asyncWrapper(userController.updateUserProfile),
);

Router.put(
  "/me/change-password",
  tokenValidator,
  asyncWrapper(userController.changePassword),
);

// User stores management
Router.get(
  "/me/stores",
  tokenValidator,
  asyncWrapper(userController.getUserAccessibleStores),
);

Router.put(
  "/me/primary-store",
  tokenValidator,
  asyncWrapper(userController.setPrimaryStore),
);

// ============ ADMIN ROUTES (Require Admin/Superadmin) ============

// User statistics (kept from original but now requires admin)
Router.get(
  "/stats",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.getUserStatistics),
);

// User management (kept from original but now requires admin)
Router.get(
  "/",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.getUsers),
);

Router.get(
  "/admins",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.getAllAdmins),
);

// Single user operations (modified to use getUserWithPermissions)
Router.get(
  "/:id",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.getUserWithPermissions),
);

Router.delete(
  "/:id",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.deleteAdmin),
);

// User role management (new)
Router.put(
  "/:id/role",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.updateUserRole),
);

// User password management (admin can change any password)
Router.put(
  "/:id/change-password",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.changePassword),
);

Router.put(
  "/:id/suspend",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.suspendUserController),
);

// Unsuspend a user
Router.put(
  "/:id/unsuspend",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.unsuspendUserController),
);

// Store assignments management (new)
Router.post(
  "/:userId/stores",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.assignStoreToUser),
);

Router.delete(
  "/:userId/stores/:storeId",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.removeStoreFromUser),
);

Router.get(
  "/:userId/stores/:storeId/permissions",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.getUserStorePermissions),
);

Router.get(
  "/:userId/stores",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.getUserAccessibleStores),
);

Router.put(
  "/:userId/primary-store",
  tokenValidator,
  adminValidator,
  asyncWrapper(userController.setPrimaryStore),
);

module.exports = Router;
