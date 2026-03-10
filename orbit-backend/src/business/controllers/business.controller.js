// controllers/business.controller.js
const businessService = require("../services/business.service");
const Business = require("../models/business.model");
// ── Register ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { business, user, subscription } = await businessService.register(
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Registration successful. Please verify your email.",
    data: {
      businessId: business._id,
      businessName: business.businessName,
      adminId: user._id,
      adminEmail: user.email,
      subscriptionPlan: subscription.planSlug,
      billingCycle: subscription.billingCycle,
      trialEndsAt: subscription.trialEndDate,
      status: business.status,
    },
  });
};

// controllers/business.controller.js — add this
const searchPublic = async (req, res) => {
  const { search = "" } = req.query;

  const query = {
    status: "active",
    isVerified: true,
  };

  if (search) {
    query.$or = [
      { businessName: { $regex: search, $options: "i" } },
      { businessType: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ];
  }

  const businesses = await Business.find(query)
    .select("_id businessName businessType city businessLogo")
    .limit(20)
    .sort({ businessName: 1 });

  res.status(200).json({ success: true, data: businesses });
};

// ── Get all businesses ────────────────────────────────────────────────────────
const getAll = async (req, res) => {
  const { businesses, pagination } = await businessService.getAll(req.query);

  res.status(200).json({
    success: true,
    data: businesses,
    pagination,
  });
};

// ── Get single business ───────────────────────────────────────────────────────
const getById = async (req, res) => {
  const business = await businessService.getById(req.params.id);

  res.status(200).json({
    success: true,
    data: business,
  });
};

// ── Get business by owner ─────────────────────────────────────────────────────
const getMyBusiness = async (req, res) => {
  const business = await businessService.getByOwner(req.user._id);

  res.status(200).json({
    success: true,
    data: business,
  });
};

// ── Update business ───────────────────────────────────────────────────────────
const update = async (req, res) => {
  const business = await businessService.update(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Business updated successfully",
    data: business,
  });
};

// ── Update status (verify / suspend / activate) ───────────────────────────────
const updateStatus = async (req, res) => {
  const { status, reason } = req.body;
  const business = await businessService.updateStatus(
    req.params.id,
    status,
    reason,
  );

  res.status(200).json({
    success: true,
    message: `Business ${status} successfully`,
    data: business,
  });
};

// ── Delete business ───────────────────────────────────────────────────────────
const deleteBusiness = async (req, res) => {
  const result = await businessService.delete(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

module.exports = {
  register,
  getAll,
  getById,
  getMyBusiness,
  update,
  updateStatus,
  deleteBusiness,
  searchPublic,
};
