

const express = require("express");

const User = require("./models/user.model.js");
const Message = require("./models/message.model.js");
const Conversation = require("./models/conversation.model.js");
const Payment = require("./models/payment.model.js");

function isValidTime(timeString) {

    const regex =
        /^(0?[1-9]|1[0-2])(?::([0-5][0-9]))?\s?(AM|PM)$/i;

    return regex.test(timeString);
}

function isValidDate(dateString) {

    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    const match = dateString.match(regex);

    if (!match) {
        return false;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

function isFutureDate(dateString) {

    const [day, month, year] =
        dateString.split("/").map(Number);

    const selectedDate =
        new Date(year, month - 1, day);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return selectedDate >= today;
}

const {
    createPaymentLink
} = require("./razorpay");
const {
    getBotReply 
} = require("./bot");
const { 
    sendTextMessage 
} = require("./whatsapp");

const router = express.Router();

router.get("/", (req, res) => {

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
        mode === "subscribe" &&
        token === process.env.VERIFY_TOKEN
    ) {
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
});

router.post("/", async (req, res) => {

    console.log("========== WEBHOOK RECEIVED ==========");

    // Tell Meta immediately that we received the webhook
    res.sendStatus(200);

    try {

        // --------------------------------
        // Extract message
        // --------------------------------

        const message =
            req.body.entry?.[0]
                ?.changes?.[0]
                ?.value?.messages?.[0];


        if (!message) {
            console.log("No WhatsApp message found");
            return;
        }


        if (message.type !== "text") {
            console.log(
                "Unsupported message type:",
                message.type
            );
            return;
        }


        const phone = message.from;

        const text =
            message.text.body.trim();


        console.log("User:", phone);
        console.log("Message:", text);
        console.log("WhatsApp Message ID:", message.id);
        console.log("Message timestamp:", message.timestamp);


        // --------------------------------
        // Prevent duplicate messages
        // --------------------------------

        const existingMessage =
            await Message.findOne({
                whatsappMessageId: message.id
            });


        if (existingMessage) {

            console.log(
                "Duplicate webhook ignored:",
                message.id
            );

            return;
        }


        // --------------------------------
        // Find or create user
        // --------------------------------

        let user = await User.findOne({
            phone
        });


        if (!user) {

            user = await User.create({
                phone
            });

            console.log("New user created");
        }


        // --------------------------------
        // Save incoming message
        // --------------------------------

        await Message.create({

            phone,

            direction: "INCOMING",

            type: "TEXT",

            message: text,

            whatsappMessageId: message.id
        });


        // --------------------------------
        // Find or create conversation
        // --------------------------------

        let conversation =
            await Conversation.findOne({
                phone
            });


        if (!conversation) {

            conversation =
                await Conversation.create({

                    phone,

                    state: "MAIN_MENU"
                });

            console.log(
                "New conversation created"
            );
        }
        
        // --------------------------------
// BOOKING DATA
// --------------------------------

    if (conversation.state === "BOOKING_DATE") {

        if (!isValidDate(text)) {

        const reply = `
Invalid date.

Please enter the date in DD/MM/YYYY format.

Example:
15/10/2026
`;

        await sendTextMessage(phone, reply);

        await Message.create({
            phone,
            direction: "OUTGOING",
            type: "TEXT",
            message: reply
        });

        return;
    }

    // Check that date is not in the past
    if (!isFutureDate(text)) {

        const reply = `
Please select today's date or a future date.
`;

        await sendTextMessage(phone, reply);

        await Message.create({
            phone,
            direction: "OUTGOING",
            type: "TEXT",
            message: reply
        });

        return;
    }

        conversation.bookingDate = text;

        conversation.state = "BOOKING_TIME";

        conversation.lastMessageAt = new Date();

        await conversation.save();

        const reply = `
Date received: ${text}

Now please enter your preferred consultation time in HH:MM format.

Example:
6 PM
6:30 PM
10 AM
10:30 AM
`;

    await sendTextMessage(
        phone,
        reply
    );

    await Message.create({

        phone,

        direction: "OUTGOING",

        type: "TEXT",

        message: reply
    });

    return;
}


    if (conversation.state === "BOOKING_TIME") {

    if (!isValidTime(text)) {

        const reply = `
Invalid time.

Please enter the time in a valid format.

Examples:
6 PM
6:30 PM
10 AM
10:30 AM
`;

        await sendTextMessage(phone, reply);

        await Message.create({
            phone,
            direction: "OUTGOING",
            type: "TEXT",
            message: reply
        });

        return;
    }

    conversation.bookingTime = text;

    conversation.state = "MAIN_MENU";

    conversation.lastMessageAt = new Date();

    await conversation.save();

    const reply = `
Thank you!

Your consultation request has been recorded.

Date: ${conversation.bookingDate}

Time: ${conversation.bookingTime}

Our team will contact you shortly.

Reply MENU to return to the main menu.
`;

    await sendTextMessage(
        phone,
        reply
    );

    await Message.create({

        phone,

        direction: "OUTGOING",

        type: "TEXT",

        message: reply
    });

    const adminPhone =
        process.env.ADMIN_WHATSAPP_NUMBER;

    const adminMessage = `
New Consultation Booking

Customer: ${phone}

Date: ${conversation.bookingDate}

Time: ${conversation.bookingTime}

Please contact the customer to confirm the consultation.
`;

    try {

        await sendTextMessage(
            adminPhone,
            adminMessage
        );

        console.log(
            "Admin notified about consultation booking"
        );

    } catch (error) {

        console.error(
            "Failed to notify admin:",
            error
        );

    }

    return;
}

        // --------------------------------
        // BOT LOGIC
        // --------------------------------

        const botResponse =
            await getBotReply(
                text,
                conversation.state
            );


        let reply =
            botResponse.reply;


        const nextState =
            botResponse.nextState;
        
        if (botResponse.action === "SAVE_BOOKING_DATE") {
            conversation.bookingDate = text;
        }

        if (botResponse.action === "SAVE_BOOKING_TIME") {
            conversation.bookingTime = text;
        }

        if (botResponse.course) {
            conversation.selectedCourse = botResponse.course;
        }


        console.log(
            "Current state:",
            conversation.state
        );

        console.log(
            "Next state:",
            nextState
        );

        if (botResponse.action === "CREATE_PAYMENT") {

        console.log("Checking existing payment...");

        try {

        // Check whether this user has already paid
        // for this particular course
            const existingPayment = await Payment.findOne({
                phone: phone,
                course: botResponse.course,
                status: "PAID"
            });

        // --------------------------------
        // ALREADY PAID
        // --------------------------------

            if (existingPayment) {

                console.log(
                    "User already paid for:",
                    botResponse.course
                );

                let groupLink;

                if (existingPayment.course === "QUANTUM_BEGINNER") {

                    groupLink =
                        process.env.BEGINNER_GROUP_LINK;

                } else if (
                    existingPayment.course === "ADVANCED_HEALING"
                ) {

                    groupLink =
                        process.env.ADVANCED_GROUP_LINK;

                } else if (
                    existingPayment.course === "PERSONAL_COACHING"
                ) {

                    groupLink =
                        process.env.COACHING_GROUP_LINK;
                }

            reply = `
You have already purchased:

${existingPayment.description}

Your payment has already been verified.

Here is your course access link:

${groupLink}

Reply MENU to return to the main menu.
`;

            // Don't create another Razorpay payment
        }

        // --------------------------------
        // NOT PAID YET
        // --------------------------------

        else {

            console.log(
                "No completed payment found. Creating payment..."
            );

            const payment =
                await createPaymentLink({

                    amount:
                        botResponse.amount,

                    description:
                        botResponse.description,

                    phone:
                        phone
                });


            await Payment.create({

                phone:

                    phone,

                course:

                    botResponse.course,

                amount:

                    botResponse.amount,

                description:

                    botResponse.description,

                razorpayPaymentLinkId:

                    payment.id,

                status:

                    "PENDING",

                groupLinkSent:

                    false
            });


            console.log(
                "Payment saved:",
                payment.id
            );


            reply = `
${botResponse.description}

Amount: ₹${botResponse.amount}

Please complete your payment using the link below:

${payment.short_url}

Once your payment is successfully completed,
your access will be provided automatically.
`;
        }

    } catch (error) {

        console.error(
            "Payment processing error:",
            error
        );

        reply = `
Sorry, we couldn't process your payment request right now.

Please try again in a few moments.
`;
    }
}


        // --------------------------------
        // Update conversation
        // --------------------------------

        conversation.state = nextState;

        conversation.lastMessageAt =
            new Date();

        await conversation.save();


        // --------------------------------
        // Send WhatsApp reply
        // --------------------------------

        await sendTextMessage(
            phone,
            reply
        );


        // --------------------------------
        // Save outgoing message
        // --------------------------------

        await Message.create({

            phone,

            direction: "OUTGOING",

            type: "TEXT",

            message: reply
        });


        console.log("Bot reply sent");


    } catch (error) {

        console.error(
            "Webhook error:",
            error
        );
    }
});



module.exports = router;