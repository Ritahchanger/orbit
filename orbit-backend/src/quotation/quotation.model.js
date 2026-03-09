const mongoose = require("mongoose");

const QuoteRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNo: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    serviceNeeded: {
      type: String,
      required: true,
      enum: [
        "Web design",
        "Solar Installation",
        "Electrical Wiring",
        "Home Appliance Repair",
        "Generator Maintenance",
        "Security Systems Setup",
        "Power Backup Solutions",
        "General Electrical Consultation",
      ],
    },
    purchaseType: {
      type: String,
      required: true,
      enum: ["Wholesale", "Retail", "Simple Item", "Service Only"],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    responded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("QuoteRequest", QuoteRequestSchema);
