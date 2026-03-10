// routes/subscription.routes.js
const express = require("express");
const asyncWrapper = require("../../middlewares/asyncMiddleware");
const tokenValidator = require("../../middlewares/tokenValidator");

const subCtrl = require("../controllers/subscription.contoller"); // ← fixed typo: "contoller"

const router = express.Router();

// ── Public: plans list (login page / pricing page can read plans) ─────────────
router.get("/plans", asyncWrapper(subCtrl.getAllPlans));
router.get("/plans/:id", asyncWrapper(subCtrl.getPlanById));

// ── All routes below require a valid token ────────────────────────────────────
router.use(tokenValidator);

// ── Plans (write — superadmin only) ──────────────────────────────────────────
router.post("/plans", asyncWrapper(subCtrl.createPlan));
router.patch("/plans/:id", asyncWrapper(subCtrl.updatePlan));
router.delete("/plans/:id", asyncWrapper(subCtrl.deletePlan));

// ── Payments — MUST come before /:id so "/payments" isn't caught as an id ────
router.get("/payments", asyncWrapper(subCtrl.getAllPayments));
router.get("/payments/:id", asyncWrapper(subCtrl.getPaymentById));
router.post("/payments", asyncWrapper(subCtrl.createPayment));
router.patch("/payments/:id", asyncWrapper(subCtrl.updatePayment));
router.delete("/payments/:id", asyncWrapper(subCtrl.deletePayment));

// ── Subscriptions ─────────────────────────────────────────────────────────────
router.get("/", asyncWrapper(subCtrl.getAllSubscriptions)); // ← only once
router.get("/my", asyncWrapper(subCtrl.getMySubscription));
router.post("/", asyncWrapper(subCtrl.createSubscription));
router.patch("/:id/cancel", asyncWrapper(subCtrl.cancelSubscription)); // ← specific before generic
router.patch("/:id", asyncWrapper(subCtrl.updateSubscription));
router.get("/:id", asyncWrapper(subCtrl.getSubscriptionById));
router.delete("/:id", asyncWrapper(subCtrl.deleteSubscription));

module.exports = router;
