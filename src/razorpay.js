const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


async function createPaymentLink({
    amount,
    description,
    phone
}) {

    const paymentLink =
        await razorpay.paymentLink.create({

            amount: amount * 100,

            currency: "INR",

            description,

            customer: {
                contact: phone
            },

            notify: {
                sms: false,
                email: false
            },

            reminder_enable: true

        });

    return paymentLink;
}


module.exports = {
    createPaymentLink
};