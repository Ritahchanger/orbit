// controllers/subscription.controller.js
const subscriptionService = require("../services/subscription.service");

class SubscriptionController {
  async getAllPlans(req, res, next) {
    try {
      const plans = await subscriptionService.getAllPlans(req.query);
      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error); // Important! Pass to error handler
    }
  }

  async getPlanById(req, res, next) {
    try {
      const plan = await subscriptionService.getPlanById(req.params.id);
      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMySubscription(req, res, next) {
    try {
      // Assuming req.user has businessId
      const subscription = await subscriptionService.getSubscriptionByBusiness(
        req.user.businessId,
      );
      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
