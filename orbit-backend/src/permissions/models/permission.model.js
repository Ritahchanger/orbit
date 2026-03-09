// models/permission.model.js
const mongoose = require("mongoose");
const PermissionSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    module: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("Permission", PermissionSchema);
