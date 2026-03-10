// controllers/subscription.controller.js
const subscriptionService = require("../services/service.service");

class SubscriptionController {
  // Plans
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

  async createPlan(req, res, next) {
    try {
      const plan = await subscriptionService.createPlan(req.body);
      res.status(201).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePlan(req, res, next) {
    try {
      const plan = await subscriptionService.updatePlan(
        req.params.id,
        req.body,
      );
      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePlan(req, res, next) {
    try {
      const result = await subscriptionService.deletePlan(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Subscriptions
  async getAllSubscriptions(req, res, next) {
    try {
      const result = await subscriptionService.getAllSubscriptions(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptionById(req, res, next) {
    try {
      const subscription = await subscriptionService.getSubscriptionById(
        req.params.id,
      );
      res.status(200).json({
        success: true,
        data: subscription,
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

  async createSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.createSubscription(
        req.body,
      );
      res.status(201).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.updateSubscription(
        req.params.id,
        req.body,
      );
      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.cancelSubscription(
        req.params.id,
        req.body.reason,
      );
      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSubscription(req, res, next) {
    try {
      const result = await subscriptionService.deleteSubscription(
        req.params.id,
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Payments
  async getAllPayments(req, res, next) {
    try {
      const result = await subscriptionService.getAllPayments(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const payment = await subscriptionService.getPaymentById(req.params.id);
      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPayment(req, res, next) {
    try {
      const payment = await subscriptionService.createPayment(req.body);
      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePayment(req, res, next) {
    try {
      const payment = await subscriptionService.updatePayment(
        req.params.id,
        req.body,
      );
      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePayment(req, res, next) {
    try {
      const result = await subscriptionService.deletePayment(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
