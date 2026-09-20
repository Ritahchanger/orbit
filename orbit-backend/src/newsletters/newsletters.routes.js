const express = require("express");
const Router = express.Router();
const newsletterController = require("./newsletter.controller");

const tokenValidator = require("../middlewares/tokenValidator");

const permissionValidator = require("../middlewares/permissionValidator");

const asyncWrapper = require("../middlewares/asyncMiddleware");

Router.post("/subscribe", asyncWrapper(newsletterController.subscribe));
Router.post("/unsubscribe", asyncWrapper(newsletterController.unsubscribe));
Router.post(
  "/preferences",
  asyncWrapper(newsletterController.updatePreferences),
);

Router.get(
  "/subscribers",
  tokenValidator,
  permissionValidator(["newsletter.view"]),
  asyncWrapper(newsletterController.getAllNewsLettersController),
);

Router.post(
  "/send",
  tokenValidator,
  permissionValidator(["newsletter.send"]),
  asyncWrapper(newsletterController.sendNewsletterController),
);

module.exports = Router;
