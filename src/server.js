require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const webhookRouter = require("./webhook");
const razorpayWebhookRouter = require("./razorpayWebhook");

const app = express();

app.use("/razorpay/webhook",
     express.raw({
        type: "application/json"
    }),
    razorpayWebhookRouter
);

app.use(express.json());

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);

        res.status(500).json({
            error: "Database connection failed"
        });
    }
});

app.use("/webhook", webhookRouter);


app.get("/", (req, res) => {
    res.json({
        message: "WhatsApp chatbot server running"
    });
});

const PORT = process.env.PORT || 3000;

module.exports = app;

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// })