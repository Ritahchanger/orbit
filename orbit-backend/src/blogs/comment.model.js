const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      trim: true,
      maxlength: 50,
      required: true,
    },
    userEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    userWebsite: {
      type: String,
      trim: true,
      required: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = commentSchema;
