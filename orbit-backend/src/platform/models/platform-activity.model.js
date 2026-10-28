// models/platform-activity.model.js
// What platform admins did in the console, kept for accountability: sign-ins
// (and failed attempts), sign-outs and business status changes.
const mongoose = require("mongoose");

const ACTIONS = [
  "auth.login",
  "auth.login_failed",
  "auth.logout",
  "business.status_changed",
];

const platformActivitySchema = new mongoose.Schema(
  {
    action: { type: String, enum: ACTIONS, required: true, index: true },
    // Who did it. A snapshot, so the entry still reads correctly if the
    // admin is later renamed or removed. For a failed login, only the email
    // that was tried.
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      email: { type: String, default: "" },
      name: { type: String, default: "" },
    },
    // What it was done to, if anything
    target: {
      type: { type: String, enum: ["business", null], default: null },
      id: { type: mongoose.Schema.Types.ObjectId, default: null },
      name: { type: String, default: "" },
    },
    // e.g. { from: "active", to: "suspended", reason: "..." }
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

platformActivitySchema.index({ createdAt: -1 });
platformActivitySchema.index({ "target.id": 1, createdAt: -1 });

module.exports = mongoose.model("PlatformActivity", platformActivitySchema);
module.exports.ACTIONS = ACTIONS;
