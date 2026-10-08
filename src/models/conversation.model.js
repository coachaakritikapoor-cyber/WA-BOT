const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            index: true
        },

        state: {
            type: String,
            default: "MAIN_MENU"
        },

        selectedCourse: {
            type: String,
            default: ""
        },

        bookingDate: {
            type: String,
            default: ""
        },

        bookingTime: {
            type: String,
            default: ""
        },

        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);