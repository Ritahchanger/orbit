// models/StoreInventory.js
const mongoose = require("mongoose");
const storeInventorySchema = new mongoose.Schema(
    {
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
            index: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        // Store-specific stock
        stock: {
            type: Number,
            required: true,
            min: [0, "Stock cannot be negative"],
            default: 0,
        },
        minStock: {
            type: Number,
            min: [0, "Minimum stock cannot be negative"],
            default: 5,
        },
        // Store-specific status
        status: {
            type: String,
            enum: ["In Stock", "Low Stock", "Out of Stock"],
            default: "Out of Stock",
        },
        // Store sales tracking
        storeSold: {
            type: Number,
            default: 0,
            min: 0,
        },
        storeRevenue: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastRestock: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);
// Compound unique index
storeInventorySchema.index({ store: 1, product: 1 }, { unique: true });
// Pre-save middleware
storeInventorySchema.pre("save", function (next) {
    if (this.stock === 0) {
        this.status = "Out of Stock";
    } else if (this.stock <= this.minStock) {
        this.status = "Low Stock";
    } else {
        this.status = "In Stock";
    }
    next();
});
const StoreInventory = mongoose.model("StoreInventory", storeInventorySchema);
module.exports = StoreInventory;