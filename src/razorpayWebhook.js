const express = require("express");
const crypto = require("crypto");

const Conversation =
    require("./models/conversation.model.js");

const Payment =
    require("./models/payment.model.js");

const {
    sendTextMessage
} = require("./whatsapp");

const router = express.Router();


router.post("/", async (req, res) => {
    console.log("========== RAZORPAY WEBHOOK HIT ==========");

    console.log("Headers:");
    console.log(req.headers);

    console.log("Raw body exists:", !!req.rawBody);

    try {

        // --------------------------------
        // GET SIGNATURE
        // --------------------------------

        const signature =
            req.headers["x-razorpay-signature"];


        if (!signature) {

            console.log(
                "Missing Razorpay signature"
            );

            return res.sendStatus(400);
        }


        // --------------------------------
        // VERIFY SIGNATURE
        // --------------------------------

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_WEBHOOK_SECRET
                )
                .update(req.body)
                .digest("hex");


        if (
            signature !==
            expectedSignature
        ) {

            console.log(
                "Invalid Razorpay signature"
            );

            return res.sendStatus(400);
        }


        // --------------------------------
        // PARSE BODY
        // --------------------------------

        const data =
            JSON.parse(
                req.body.toString()
            );


        console.log(
            "Razorpay webhook received:",
            data.event
        );


        // --------------------------------
        // PAYMENT SUCCESS
        // --------------------------------

        if (
            data.event ===
            "payment_link.paid"
        ) {

            const paymentLink =
                data.payload
                    ?.payment_link
                    ?.entity;


            if (!paymentLink) {

                return res.sendStatus(200);
            }


            const paymentLinkId =
                paymentLink.id;


            const razorpayPaymentId =
                paymentLink.payment_id;


            // --------------------------------
            // FIND PAYMENT
            // --------------------------------

            const payment =
                await Payment.findOne({

                    razorpayPaymentLinkId:
                        paymentLinkId
                });


            if (!payment) {

                console.log(
                    "Payment not found:",
                    paymentLinkId
                );

                return res.sendStatus(200);
            }


            // --------------------------------
            // PREVENT DUPLICATE PROCESSING
            // --------------------------------

            if (
                payment.status === "PAID"
            ) {
                
                console.log(
                    "Payment already processed:",
                    paymentLinkId
                );

                return res.sendStatus(200);
            }


            // --------------------------------
            // UPDATE PAYMENT
            // --------------------------------

            payment.status = "PAID";

            payment.razorpayPaymentId =
                razorpayPaymentId;

            await payment.save();

            const conversation =
                await Conversation.findOne({
                    phone: payment.phone
                });

                if (conversation) {

                    conversation.state =
                        "COURSE_ACCESS";

                    conversation.lastMessageAt =
                        new Date();

                    await conversation.save();

                    console.log(
                        "Conversation state updated to COURSE_ACCESS"
                    );
                }


            console.log(
                "PAYMENT VERIFIED:",
                paymentLinkId
            );


            // --------------------------------
            // SEND WHATSAPP MESSAGE
            // --------------------------------

            let groupLink;

            if (payment.course === "QUANTUM_BEGINNER") {

                groupLink =
                process.env.BEGINNER_GROUP_LINK;

            } else if (payment.course === "ADVANCED_HEALING") {

                groupLink =
                process.env.ADVANCED_GROUP_LINK;

            } else if (payment.course === "PERSONAL_COACHING") {

                groupLink =
                process.env.COACHING_GROUP_LINK;

            } else {

                console.log(
                    "Unknown course:",
                    payment.course
                );

                return res.sendStatus(200);
            }

            const message = `
Payment successful! 🎉

Thank you for purchasing:

${payment.description}

Your payment has been verified successfully.

Here is your course access link:

${groupLink}
`;


            await sendTextMessage(
                payment.phone,
                message
            );

            payment.groupLinkSent = true;
            await payment.save();

            console.log(
                "Payment confirmation sent"
            );
        }


        return res.sendStatus(200);


    } catch (error) {

        console.error(
            "Razorpay webhook error:",
            error
        );

        return res.sendStatus(500);
    }

});


module.exports = router;
