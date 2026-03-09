const mongoose = require("mongoose");

require("./model/category.model");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: async function (value) {
          const Category = mongoose.model("Category");
          const exists = await Category.findOne({ name: value });
          return !!exists;
        },
        message: "Invalid category",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    minStock: {
      type: Number,
      min: [0, "Minimum stock cannot be negative"],
      default: 5,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    specifications: [
      {
        type: String,
        trim: true,
      },
    ],
    weight: {
      type: String,
      trim: true,
    },
    dimensions: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, "Brand name cannot exceed 100 characters"],
    },
    warranty: {
      type: String,
      default: "1 Year",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Simplified images field with only displayUrl and gcsFileName
    images: [
      {
        displayUrl: {
          type: String,
          required: true,
        },
        gcsFileName: {
          type: String,
          required: true,
        },
        // Optional: Mark as primary image
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "discontinued",
        "In Stock",
        "Low Stock",
        "Out of Stock",
      ],
      default: "active",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    lastRestock: {
      type: Date,
      default: Date.now,
    },
    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    productType: {
      type: String,
      enum: ["gaming", "electrical", "general"],
      default: "general",
    },
    model: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    connectivity: {
      type: String,
      trim: true,
    },
    powerConsumption: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual fields to match frontend naming
productSchema.virtual("specs").get(function () {
  return this.description;
});

productSchema.virtual("sellingPrice").get(function () {
  return this.price;
});

productSchema.virtual("buyingPrice").get(function () {
  return this.costPrice;
});

productSchema.virtual("quantity").get(function () {
  return this.stock;
});

// Virtual for primary image URL
productSchema.virtual("primaryImage").get(function () {
  // Safely check if images exists and is an array
  if (!this.images || !Array.isArray(this.images)) {
    return null;
  }
  const primary = this.images.find((img) => img && img.isPrimary);
  return primary ? primary.displayUrl : this.images[0]?.displayUrl || null;
});

// Virtual for all GCS file names (for batch deletion)
productSchema.virtual("gcsFileNames").get(function () {
  if (!this.images || !Array.isArray(this.images)) {
    return [];
  }
  return this.images.map((img) => img.gcsFileName);
});

// Virtual for simplified frontend image format
productSchema.virtual("productImages").get(function () {
  if (!this.images || !Array.isArray(this.images)) {
    return [];
  }
  return this.images.map((img) => ({
    url: img.displayUrl,
    gcsFileName: img.gcsFileName,
    isPrimary: img.isPrimary,
  }));
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ productType: 1 });
productSchema.index({ brand: 1 });

// Virtual for total value in inventory
productSchema.virtual("inventoryValue").get(function () {
  return this.costPrice * this.stock;
});

// Virtual for profit per unit
productSchema.virtual("profitPerUnit").get(function () {
  return this.price - this.costPrice;
});

// Virtual for total potential profit
productSchema.virtual("totalPotentialProfit").get(function () {
  return this.profitPerUnit * this.stock;
});

// Pre-save middleware
productSchema.pre("save", function (next) {
  if (!this.sku) {
    const prefix = this.productType === "gaming" ? "GAM" : "AMP";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.sku = `${prefix}-${timestamp}-${random}`;
  }

  // Recalculate margin
  if (this.costPrice && this.price) {
    this.margin = ((this.price - this.costPrice) / this.costPrice) * 100;
  }

  // Update low stock alert
  this.lowStockAlert = this.stock <= this.minStock;

  // Auto-update status based on stock
  if (this.stock === 0) {
    this.status = "Out of Stock";
  } else if (this.stock <= this.minStock) {
    this.status = "Low Stock";
  } else if (this.status === "active") {
    this.status = "In Stock";
  }

  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter((img) => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep first as primary, set others to false
      for (let i = 1; i < primaryImages.length; i++) {
        primaryImages[i].isPrimary = false;
      }
    }
  }

  next();
});

// Pre-save middleware for features
productSchema.pre("save", function (next) {
  if (this.features.length === 0 && this.description) {
    this.features = [this.description.substring(0, 100) + "..."];
  }

  if (this.specifications.length === 0) {
    this.specifications = ["Standard specifications"];
  }

  next();
});

// Static Methods
productSchema.statics.getByCategory = function (category) {
  return this.find({
    category,
    status: { $in: ["active", "In Stock", "Low Stock"] },
  });
};

productSchema.statics.getLowStock = function () {
  return this.find({
    $expr: { $lte: ["$stock", "$minStock"] },
    status: { $in: ["active", "Low Stock"] },
  });
};

productSchema.statics.getFeatured = function () {
  return this.find({
    isFeatured: true,
    status: { $in: ["active", "In Stock"] },
  });
};

productSchema.statics.getGamingProducts = function () {
  return this.find({
    productType: "gaming",
    status: { $in: ["active", "In Stock", "Low Stock"] },
  });
};

// Instance Methods for Image Management
productSchema.methods.addImage = function (
  displayUrl,
  gcsFileName,
  isPrimary = false,
) {
  if (isPrimary) {
    // Set all other images as non-primary
    this.images.forEach((img) => {
      img.isPrimary = false;
    });
  }

  this.images.push({
    displayUrl,
    gcsFileName,
    isPrimary,
  });

  return this.save();
};

// Add multiple images at once
productSchema.methods.addImages = function (imageArray) {
  imageArray.forEach((image) => {
    this.images.push({
      displayUrl: image.displayUrl,
      gcsFileName: image.gcsFileName,
      isPrimary: image.isPrimary || false,
    });
  });

  return this.save();
};

// Remove image by GCS filename (for deletion)
productSchema.methods.removeImage = function (gcsFileName) {
  const imageIndex = this.images.findIndex(
    (img) => img.gcsFileName === gcsFileName,
  );

  if (imageIndex === -1) {
    throw new Error(`Image with filename ${gcsFileName} not found`);
  }

  const removedImage = this.images[imageIndex];
  this.images.splice(imageIndex, 1);

  // If we removed the primary image and there are other images, set a new primary
  if (removedImage.isPrimary && this.images.length > 0) {
    this.images[0].isPrimary = true;
  }

  return this.save().then(() => ({
    success: true,
    gcsFileName: removedImage.gcsFileName,
  }));
};

// Remove all images (for product deletion)
productSchema.methods.removeAllImages = function () {
  const imagesToDelete = this.images.map((img) => ({
    gcsFileName: img.gcsFileName,
  }));

  this.images = [];
  return this.save().then(() => ({
    success: true,
    deletedCount: imagesToDelete.length,
    images: imagesToDelete,
  }));
};

// Set primary image
productSchema.methods.setPrimaryImage = function (gcsFileName) {
  let found = false;

  this.images.forEach((img) => {
    if (img.gcsFileName === gcsFileName) {
      img.isPrimary = true;
      found = true;
    } else {
      img.isPrimary = false;
    }
  });

  if (!found) {
    throw new Error(`Image with filename ${gcsFileName} not found`);
  }

  return this.save();
};

// Get image by GCS filename
productSchema.methods.getImageByFilename = function (gcsFileName) {
  return this.images.find((img) => img.gcsFileName === gcsFileName);
};

// Clear all images
productSchema.methods.clearImages = function () {
  this.images = [];
  return this.save();
};

// Update image display URL
productSchema.methods.updateImageUrl = function (gcsFileName, newDisplayUrl) {
  const image = this.images.find((img) => img.gcsFileName === gcsFileName);

  if (!image) {
    throw new Error(`Image with filename ${gcsFileName} not found`);
  }

  image.displayUrl = newDisplayUrl;
  return this.save();
};

// Instance method to check if product is in stock
productSchema.methods.isInStock = function () {
  return this.stock > 0;
};

// Instance method to update stock and auto-update status
productSchema.methods.updateStock = function (newStock) {
  this.stock = newStock;
  this.lowStockAlert = this.stock <= this.minStock;

  if (this.stock === 0) {
    this.status = "Out of Stock";
  } else if (this.stock <= this.minStock) {
    this.status = "Low Stock";
  } else {
    this.status = "In Stock";
  }

  return this.save();
};

// Instance method to record a sale
productSchema.methods.recordSale = function (
  quantity,
  sellingPrice = this.price,
) {
  this.stock -= quantity;
  this.totalSold += quantity;
  this.totalRevenue += quantity * sellingPrice;

  if (this.stock <= this.minStock) {
    this.status = "Low Stock";
  }

  if (this.stock === 0) {
    this.status = "Out of Stock";
  }

  return this.save();
};

// Instance method to restock product
productSchema.methods.restock = function (
  quantity,
  buyingPrice = this.costPrice,
) {
  this.stock += quantity;
  this.costPrice = buyingPrice;
  this.lastRestock = new Date();

  if (this.stock > this.minStock) {
    this.status = "In Stock";
  }

  return this.save();
};

// Instance method to get frontend-compatible data
productSchema.methods.toFrontendFormat = function () {
  const product = this.toObject();

  // Add virtual fields
  product.specs = this.description;
  product.sellingPrice = this.price;
  product.buyingPrice = this.costPrice;
  product.quantity = this.stock;
  product.primaryImage = this.primaryImage;

  if (this.lastRestock) {
    product.lastRestock = this.lastRestock.toISOString().split("T")[0];
  }

  // Simplify images array
  product.images = this.images.map((img) => ({
    url: img.displayUrl,
    gcsFileName: img.gcsFileName,
    isPrimary: img.isPrimary,
  }));

  // Add profit calculation
  product.profit = this.price - this.costPrice;
  product.profitPercentage =
    this.costPrice > 0
      ? (((this.price - this.costPrice) / this.costPrice) * 100).toFixed(1)
      : 0;

  return product;
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
