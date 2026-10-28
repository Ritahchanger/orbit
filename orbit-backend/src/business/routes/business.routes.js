// routes/business.routes.js
const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../middlewares/asyncMiddleware");
const businessCtrl = require("../controllers/business.controller");
const tokenValidator = require("../../middlewares/refreshTokenValidator");
const businessAccess = require("../middlewares/business-access.middleware");

// ✅ register is PUBLIC — no tokenValidator
router.post("/register", asyncWrapper(businessCtrl.register));

router.get("/search", asyncWrapper(businessCtrl.searchPublic));

// ✅ everything below requires a valid token
router.use(tokenValidator);

router.get("/my-business", asyncWrapper(businessCtrl.getMyBusiness));

router.get(
  "/ecommerce-settings",
  asyncWrapper(businessCtrl.getEcommerceSettings),
);

router.patch(
  "/ecommerce-settings",
  asyncWrapper(businessCtrl.updateEcommerceSettings),
);

// A business's own users only. Listing every business and changing a
// business's status are platform-dashboard actions (/api/v1/platform).
router.get("/:id", businessAccess(), asyncWrapper(businessCtrl.getById));

router.patch(
  "/:id",
  businessAccess({ roles: ["admin", "superadmin"] }),
  asyncWrapper(businessCtrl.update),
);

module.exports = router;
