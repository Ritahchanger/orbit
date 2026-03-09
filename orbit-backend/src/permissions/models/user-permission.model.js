// models/userPermission.model.js
const mongoose = require("mongoose");

const UserPermissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    permission: {
        type: String, 
        required: true,
        index: true
    },

    scope: {
        type: String,
        enum: ["global", "store"],
        default: "global"
    },

    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        default: null
    }
}, { timestamps: true });

UserPermissionSchema.index(
    { user: 1, permission: 1, store: 1 },
    { unique: true }
);

module.exports = mongoose.model("UserPermission", UserPermissionSchema);
