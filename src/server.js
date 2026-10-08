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
    razorpayWebhookRouter);

app.use(express.json());
app.use("/webhook", webhookRouter);
connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "WhatsApp chatbot server running"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});