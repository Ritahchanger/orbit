// services/subscription.service.js
const { PlanTemplate, Subscription } = require("../models/subscription.model");

class SubscriptionService {
  async getAllPlans(filters = {}) {
    const {
      isActive,
      search,
      sortBy = "monthlyPrice",
      order = "asc",
    } = filters;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const sort = { [sortBy]: order === "desc" ? -1 : 1 };

    const plans = await PlanTemplate.find(query).sort(sort);
    return plans;
  }

  async getPlanById(id) {
    const plan = await PlanTemplate.findById(id);
    if (!plan) throw new Error("Plan not found");
    return plan;
  }

  async getPlanBySlug(slug) {
    const plan = await PlanTemplate.findOne({ slug });
    if (!plan) throw new Error(`Plan '${slug}' not found`);
    return plan;
  }

  async getSubscriptionByBusiness(businessId) {
    const sub = await Subscription.findOne({ business: businessId }).populate(
      "plan",
      "name slug monthlyPrice annualPrice currency features maxStores maxUsers",
    );

    if (!sub) throw new Error("No subscription found for this business");
    return sub;
  }
}

module.exports = new SubscriptionService();
