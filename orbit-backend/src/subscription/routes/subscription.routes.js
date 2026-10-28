// routes/subscription.routes.js
const express = require("express");
const asyncWrapper = require("../../middlewares/asyncMiddleware");
const tokenValidator = require("../../middlewares/refreshTokenValidator");

const subCtrl = require("../controllers/subscription.controller");

const router = express.Router();

// ── Public: plans list (sign-up / pricing pages can read plans) ───────────────
router.get("/plans", asyncWrapper(subCtrl.getAllPlans));
router.get("/plans/:id", asyncWrapper(subCtrl.getPlanById));

// ── A business's own subscription ─────────────────────────────────────────────
// Managing plans, subscriptions and payments across businesses is done from
// the platform console (/api/v1/platform/billing), never by business users.
router.get("/my", tokenValidator, asyncWrapper(subCtrl.getMySubscription));

module.exports = router;
