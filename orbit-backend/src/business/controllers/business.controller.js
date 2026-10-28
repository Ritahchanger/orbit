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

const searchPublic = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      data: businesses,
      count: businesses.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching businesses",
    });
  }
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
  
  const businessId = req.businessId;

  const business = await businessService.getByOwner(businessId);

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

// ── Ecommerce Settings ───────────────────────────────────────────────────────────
const getEcommerceSettings = async (req, res) => {
  const ecommerce = await businessService.getEcommerceSettings(req.businessId);

  res.status(200).json({
    success: true,
    data: ecommerce,
  });
};

const updateEcommerceSettings = async (req, res) => {
  const ecommerce = await businessService.updateEcommerceSettings(
    req.businessId,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Ecommerce settings updated successfully",
    data: ecommerce,
  });
};

module.exports = {
  register,
  getById,
  getMyBusiness,
  update,
  searchPublic,
  getEcommerceSettings,
  updateEcommerceSettings,
};
