const Joi = require("joi");

const subscribeNewsletterValidator = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  preferences: Joi.object()
    .pattern(Joi.string(), Joi.boolean())
    .optional()
    .label("Preferences"),
});

const updatePreferencesValidator = Joi.object({
  preferences: Joi.object()
    .pattern(Joi.string(), Joi.boolean())
    .required()
    .label("Preferences"),
});

const unsubscribeValidator = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  token: Joi.string().required().label("Unsubscribe Token"),
});

module.exports = {
  subscribeNewsletterValidator,
  updatePreferencesValidator,
  unsubscribeValidator,
};
