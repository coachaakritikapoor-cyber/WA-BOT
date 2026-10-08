const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        name: {
            type: String,
            default: ""
        },

        email: {
            type: String,
            default: ""
        },

        state: {
            type: String,
            default: "MAIN_MENU"
        },

        botEnabled: {
            type: Boolean,
            default: true
        },

        isLead: {
            type: Boolean,
            default: false
        },

        paymentStatus: {
            type: String,
            enum: [
                "NOT_STARTED",
                "PENDING",
                "PAID",
                "FAILED"
            ],
            default: "NOT_STARTED"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);