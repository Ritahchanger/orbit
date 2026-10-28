// routes/business.routes.js
const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../middlewares/asyncMiddleware");
const businessCtrl = require("../controllers/business.controller");
const tokenValidator = require("../../middlewares/refreshTokenValidator");
const platformAdminValidator = require("../../middlewares/platformAdminValidator");
const businessAccess = require("../middlewares/business-access.middleware");

// ✅ register is PUBLIC — no tokenValidator
router.post("/register", asyncWrapper(businessCtrl.register));

router.get("/search", asyncWrapper(businessCtrl.searchPublic));

// ✅ everything below requires a valid token
router.use(tokenValidator);

// Every business on the platform — Orbit's platform admins only
router.get("/", platformAdminValidator, asyncWrapper(businessCtrl.getAll));

router.get("/my-business", asyncWrapper(businessCtrl.getMyBusiness));

router.get(
  "/ecommerce-settings",
  asyncWrapper(businessCtrl.getEcommerceSettings),
);

router.patch(
  "/ecommerce-settings",
  asyncWrapper(businessCtrl.updateEcommerceSettings),
);

// A business's own users (or a platform admin) only
router.get("/:id", businessAccess(), asyncWrapper(businessCtrl.getById));

router.patch(
  "/:id",
  businessAccess({ roles: ["admin", "superadmin"] }),
  asyncWrapper(businessCtrl.update),
);

// Verify / suspend / cancel and delete — platform admins only
router.patch(
  "/:id/status",
  platformAdminValidator,
  asyncWrapper(businessCtrl.updateStatus),
);

router.delete(
  "/:id",
  platformAdminValidator,
  asyncWrapper(businessCtrl.deleteBusiness),
);

module.exports = router;
