// controllers/billing.controller.js
const billingService = require("../services/platform-billing.service");
const activityService = require("../services/platform-activity.service");

const targetOf = (business) => ({ type: "business", id: business._id, name: business.businessName });

const listSubscriptions = async (req, res) => {
  const { subscriptions, counts, pagination } = await billingService.listSubscriptions(req.query);
  res.status(200).json({ success: true, data: subscriptions, counts, pagination });
};

const listPayments = async (req, res) => {
  const { payments, pagination } = await billingService.listPayments(req.query);
  res.status(200).json({ success: true, data: payments, pagination });
};

const listPlans = async (req, res) => {
  res.status(200).json({ success: true, data: await billingService.listPlans() });
};

const extendTrial = async (req, res) => {
  const { business, result } = await billingService.extendTrial(req.params.id, req.body?.days);
  await activityService.record(req, {
    action: "subscription.trial_extended",
    admin: req.platformAdmin,
    target: targetOf(business),
    details: {
      days: result.days,
      from: result.previousEnd,
      to: result.trialEndDate,
      reason: String(req.body?.reason || "").trim(),
    },
  });
  res.status(200).json({ success: true, message: `Trial extended by ${result.days} days`, data: result });
};

const changePlan = async (req, res) => {
  const { planSlug, billingCycle, reason } = req.body || {};
  const { business, result } = await billingService.changePlan(req.params.id, { planSlug, billingCycle });
  await activityService.record(req, {
    action: "subscription.plan_changed",
    admin: req.platformAdmin,
    target: targetOf(business),
    details: { from: result.previous, to: result.current, reason: String(reason || "").trim() },
  });
  res.status(200).json({ success: true, message: "Plan changed", data: result });
};

const recordPayment = async (req, res) => {
  const { business, result } = await billingService.recordPayment(req.params.id, req.body || {}, req.platformAdmin);
  await activityService.record(req, {
    action: "payment.recorded",
    admin: req.platformAdmin,
    target: targetOf(business),
    details: {
      amount: result.payment.amount,
      currency: result.payment.currency,
      method: result.payment.paymentMethod,
      reference: result.payment.transactionRef,
      periodEnd: result.subscription.currentPeriodEnd,
    },
  });
  res.status(201).json({ success: true, message: "Payment recorded", data: result });
};

module.exports = { listSubscriptions, listPayments, listPlans, extendTrial, changePlan, recordPayment };
