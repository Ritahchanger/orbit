const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    slug: {
      type: String,
      lowercase: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Names and slugs only need to be unique within a business. Existing
// databases still carry the old global unique indexes (name_1, slug_1);
// run src/seeders/sync-category-indexes.js once to replace them.
categorySchema.index({ businessId: 1, name: 1 }, { unique: true });
categorySchema.index({ businessId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
