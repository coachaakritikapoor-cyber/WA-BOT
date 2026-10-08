
async function getBotReply(message, currentState = "MAIN_MENU") {

    const text = message.toLowerCase().trim();

    // --------------------------------
    // GLOBAL COMMANDS
    // --------------------------------

    if (
        text === "hi" ||
        text === "hello" ||
        text === "hey" ||
        text === "menu"
    ) {

        return {
            reply: `
Welcome! 👋

How can we help you?

1️⃣ View Courses
2️⃣ Course Pricing
3️⃣ Book Consultation
4️⃣ Payment Information
5️⃣ Talk to Human

Reply with 1, 2, 3, 4 or 5.`,
            nextState: "MAIN_MENU"
        };
    }


    // --------------------------------
    // MAIN MENU
    // --------------------------------

    if (currentState === "MAIN_MENU") {

        if (text === "1") {

            return{ reply: ` 
Our Courses 📚 
1️⃣ Quantum Healing Beginner Course 
2️⃣ Advanced Healing Program 
3️⃣ Personal Coaching Program Reply with the course number. `, 

            nextState: "COURSE_SELECTION" };
        }


        if (text === "2") {

            return {
                reply: `
Course Pricing 💰

Beginner Course: ₹XXXX

Advanced Program: ₹XXXX

Personal Consultation: ₹XXXX

Reply MENU to return.`,
                nextState: "MAIN_MENU"
            };
        }


        if (text === "3") {

            return {
        reply: `
Please enter your preferred consultation date in DD/MM/YYYY format.

Example:
15/08/2024
`,
        nextState: "BOOKING_DATE"
        };
        }


        if (text === "4") {

            return {
                reply: `
Payment Information 💳

You can complete your payment using our secure payment page:

YOUR_PAYMENT_LINK`,
                nextState: "PAYMENT"
            };
        }


        if (text === "5") {

    return {
        reply: `
For further assistance, please contact our team directly:

📞 +91 9717612369

Our team will be happy to assist you.
`,
        nextState: "MAIN_MENU"
    };
}


        return {
            reply: `
Sorry, I didn't understand that.

Please choose:

1️⃣ View Courses
2️⃣ Course Pricing
3️⃣ Book Consultation
4️⃣ Payment Information
5️⃣ Talk to Human`,
            nextState: "MAIN_MENU"
        };
    }


    // --------------------------------
    // COURSE SELECTION
    // --------------------------------

    if (currentState === "COURSE_SELECTION") {

        if (text === "1") {

            return {
        action: "COURSE_SELECTED",
        course: "QUANTUM_BEGINNER",

        reply: `
Quantum Healing Beginner Course 📚

Price: ₹999

Reply BUY to purchase this course.

Reply MENU to return.
`,

        nextState: "COURSE_BEGINNER"
    };
        }


        if (text === "2") {

            return {
                action: "COURSE_SELECTED",
                course: "ADVANCED_HEALING",
                reply: `
Advanced Healing Program 📚
Price: ₹XXXX

This program is designed for
advanced-level learning.
Reply BUY to purchase this course.

Reply MENU to return to the main menu.`,
                nextState: "COURSE_ADVANCED"
            };
        }


        if (text === "3") {

            return {
                action: "COURSE_SELECTED",
                course: "PERSONAL_COACHING",
                reply: `
Personal Coaching Program 📚

Price: ₹XXXX

This program provides personalized
one-to-one guidance.

Reply BUY to purchase this program.

Reply MENU to return to the main menu.`,
                nextState: "COURSE_COACHING"
            };
        }


        return {
            reply: `
Invalid option.

Please choose:

1️⃣ Beginner Course
2️⃣ Advanced Program
3️⃣ Personal Coaching Program`,
            nextState: "COURSE_SELECTION"
        };
    }


    // --------------------------------
    // BEGINNER COURSE
    // --------------------------------

    if (currentState === "COURSE_BEGINNER") {

        if (text === "buy") {

            return {
                action: "CREATE_PAYMENT", 

                course: "QUANTUM_BEGINNER", 

                amount: 999, 

                description: "Quantum Healing Beginner Course",

                reply: `
Creating your payment link...`,
                nextState: "PAYMENT"
            };
        }


        return {
            action: "REPLY",
            reply: `
Reply BUY to purchase the
Quantum Healing Beginner Course.

Reply MENU to return.`,
            nextState: "COURSE_BEGINNER"
        };
    }


    // --------------------------------
    // ADVANCED COURSE
    // --------------------------------

    if (currentState === "COURSE_ADVANCED") {

        if (text === "buy") {

            return {
            action: "CREATE_PAYMENT",

            course: "ADVANCED_HEALING",

            amount: 1499,

            description:
                "Advanced Healing Program",

            reply: `
Creating your payment link...`,

            nextState: "PAYMENT"
            };
        }


        return {
            action: "REPLY",
            reply: `
Reply BUY to purchase the
Advanced Healing Program.

Reply MENU to return.`,
            nextState: "COURSE_ADVANCED"
        };
    }


    // --------------------------------
    // PERSONAL COACHING
    // --------------------------------

    if (currentState === "COURSE_COACHING") {

    if (text === "buy") {

        return {
            action: "CREATE_PAYMENT",

            course: "PERSONAL_COACHING",

            amount: 1999,

            description:
                "Personal Coaching Program",

            reply: `
Creating your payment link...`,

            nextState: "PAYMENT"
        };
    }

    return {
        action: "REPLY",

        reply: `
Reply BUY to purchase the
Personal Coaching Program.

Reply MENU to return.`,

        nextState: "COURSE_COACHING"
    };
}


    // --------------------------------
    // BOOKING
    // --------------------------------

    // --------------------------------
// BOOKING - DATE
// --------------------------------


    // --------------------------------
    // PAYMENT
    // --------------------------------

    if (currentState === "PAYMENT") {

        

    return {
        reply: `
Your payment link has already been sent.

Please complete the payment using the link provided.

Once payment is verified, your course access will be sent automatically.

Reply MENU to return to the main menu.
        `,
        nextState: "PAYMENT"
    };
    
    }


    // --------------------------------
    // HUMAN SUPPORT
    // --------------------------------


    if (currentState === "COURSE_ACCESS") {

    return {
        reply: `
Your payment has already been verified.

Your course access link has been sent to you.

Reply MENU to return to the main menu.
        `,
        nextState: "COURSE_ACCESS"
        };
    }

    // --------------------------------
    // FALLBACK
    // --------------------------------

    return {
        reply: `
Sorry, I didn't understand that.

Send HI to see the main menu.`,
        nextState: "MAIN_MENU"
    };
}


module.exports = {
    getBotReply
};

