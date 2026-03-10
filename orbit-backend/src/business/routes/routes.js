// routes/business.routes.js
const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../middlewares/asyncMiddleware");
const businessCtrl = require("../controllers/business.controller");
const tokenValidator = require("../../middlewares/tokenValidator");

// ✅ register is PUBLIC — no tokenValidator
router.post("/register", asyncWrapper(businessCtrl.register));

router.get("/search", asyncWrapper(businessCtrl.searchPublic));

// ✅ everything below requires a valid token
router.use(tokenValidator);

router.get("/", asyncWrapper(businessCtrl.getAll));
router.get("/my-business", asyncWrapper(businessCtrl.getMyBusiness));
router.get("/:id", asyncWrapper(businessCtrl.getById));
router.patch("/:id", asyncWrapper(businessCtrl.update));
router.patch("/:id/status", asyncWrapper(businessCtrl.updateStatus));
router.delete("/:id", asyncWrapper(businessCtrl.deleteBusiness));

module.exports = router;
