const mongoose = require("mongoose");

const consultationEmailLogSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },
    cc: [String],
    bcc: [String],
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    templateUsed: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "rescheduled"],
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    messageId: {
      type: String,
    },
    deliveryStatus: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "ConsultationEmailLog",
  consultationEmailLogSchema,
);
