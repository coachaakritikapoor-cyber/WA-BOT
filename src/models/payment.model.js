const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: true
    },

    course: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    razorpayPaymentLinkId: {
        type: String,
        required: true,
        unique: true
    },

    razorpayPaymentId: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: [
            "PENDING",
            "PAID",
            "FAILED"
        ],
        default: "PENDING"
    },

    groupLinkSent: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

module.exports =
    mongoose.model(
        "Payment",
        paymentSchema
    );

