require("dotenv").config();

const {
    createPaymentLink
} = require("./razorpay");

async function test() {

    try {

        const payment =
            await createPaymentLink({

                amount: 1,

                description:
                    "Quantum Healing Beginner Course",

                phone:
                    "919654180683"
            });

        console.log("Payment created!");

        console.log(
            "Payment ID:",
            payment.id
        );

        console.log(
            "Payment Link:",
            payment.short_url
        );

    } catch (error) {

        console.error(error);
    }
}

test();