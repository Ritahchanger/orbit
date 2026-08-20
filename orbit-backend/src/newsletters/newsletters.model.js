const mongoose = require("mongoose");

const NewsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    subscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    preferences: {
      type: Map,
      of: Boolean,
      default: {},
    },
    // Optional: the public subscribe endpoint has no way to attribute a
    // subscriber to a specific business, so this is only ever set for
    // subscribers created/attributed in a business-scoped context.
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Newsletter", NewsletterSchema);
