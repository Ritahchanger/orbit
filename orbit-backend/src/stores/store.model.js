// models/Store.js
const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Store name is required"],
        trim: true
    },
    code: {
        type: String,
        required: [true, "Store code is required"],
        unique: true,
        uppercase: true
    },
    address: {
        street: String,
        building: String,
        floor: String,
        city: { type: String, default: "Nairobi" },
        county: { type: String, default: "Nairobi" }
    },
    phone: String,
    email: String,
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    openingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    status: {
        type: String,
        enum: ["active", "inactive", "maintenance"],
        default: "active"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Store = mongoose.model("Store", storeSchema);

module.exports = Store