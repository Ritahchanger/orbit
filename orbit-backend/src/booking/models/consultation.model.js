// models/ConsultationType.js
const mongoose = require("mongoose");

const consultationTypeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "KES",
    },
    display: {
      type: String,
      required: true,
    },
  },
  icon: {
    type: String,
    default: "💻",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  features: [
    {
      type: String,
    },
  ],
  order: {
    type: Number,
    default: 0,
  },

});

const ConsultationType = mongoose.model(
  "ConsultationType",
  consultationTypeSchema,
);

module.exports = ConsultationType;
