const Joi = require("joi")

const quotationSchema = Joi.object({
    fullName: Joi.string().min(3).max(100).required().label("Full Name"),
    email: Joi.string().email().required().label("Email"),
    phoneNo: Joi.string()
      .pattern(/^\+?\d{10,15}$/)
      .required()
      .label("Phone Number"),
    location: Joi.string().required().label("Location"),
    serviceNeeded: Joi.string().required().label("Service Needed"),
    purchaseType: Joi.string()
      .valid("Wholesale", "Retail", "Simple Item", "Service Only")
      .required()
      .label("Purchase Type"),
    message: Joi.string().min(10).required().label("Message"),
  });
  

  module.exports =  quotationSchema 