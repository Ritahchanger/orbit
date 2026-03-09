const Joi = require("joi");

const featureSchema = Joi.object({
  icon: Joi.string().required().label("Feature Icon"),
  title: Joi.string().required().label("Feature Title"),
  desc: Joi.string().required().label("Feature Description"),
});

const statsSchema = Joi.object({
  completed: Joi.string().required().label("Completed Stats"),
  rating: Joi.string()
    .pattern(/^\d(\.\d)?\/5$/)
    .required()
    .label("Rating"), // Example: "4.9/5"
  warranty: Joi.string().required().label("Warranty Info"),
});

const serviceSchema = Joi.object({
  title: Joi.string().required().label("Service Title"),
  icon: Joi.string().required().label("Service Icon"),
  description: Joi.string().required().label("Service Description"),
  features: Joi.array()
    .items(featureSchema)
    .min(1)
    .required()
    .label("Features"),
  stats: statsSchema.required().label("Service Stats"),
});

module.exports = { featureSchema, statsSchema, serviceSchema };
