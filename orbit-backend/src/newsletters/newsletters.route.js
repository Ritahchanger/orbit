const express = require("express");
const Router = express.Router();
const newsletterController = require("./newsletter.controller");

const asyncWrapper = require("../middlewares/asyncMiddleware");

Router.post("/subscribe", asyncWrapper(newsletterController.subscribe));
Router.post("/unsubscribe", asyncWrapper(newsletterController.unsubscribe));
Router.post(
  "/preferences",
  asyncWrapper(newsletterController.updatePreferences)
);

Router.get("/subscribers", asyncWrapper(newsletterController.getAllNewsLettersController));

Router.post(
  "/send",
  asyncWrapper(newsletterController.sendNewsletterController)
);

module.exports = Router;
