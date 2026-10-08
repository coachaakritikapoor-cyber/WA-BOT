const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            index: true
        },

        direction: {
            type: String,
            enum: ["INCOMING", "OUTGOING"],
            required: true
        },

        type: {
            type: String,
            enum: [
                "TEXT",
                "IMAGE",
                "VIDEO",
                "DOCUMENT",
                "BUTTON",
                "LIST"
            ],
            default: "TEXT"
        },

        message: {
            type: String,
            default: ""
        },

        whatsappMessageId: {
            type: String,
            default: "",
            index: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Message", messageSchema);