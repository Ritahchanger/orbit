const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema({
  icon: {
    type: String, 
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
});

const StatsSchema = new mongoose.Schema({
  completed: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  warranty: {
    type: String,
    required: true,
  },
});

const ServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String, 
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    features: [FeatureSchema], 
    stats: StatsSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
