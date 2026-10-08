const axios = require("axios");

async function sendTextMessage(to, message) {

  try {
    
    const url =
      `https://graph.facebook.com/${process.env.GRAPH_API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
          preview_url: false,
          body: message
        }
      },
      {
        headers: {
          Authorization:
            `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Message sent");

    return response.data;

  } catch (error) {

    console.error(
      "WhatsApp API Error:",
      error.response?.data || error.message
    );

  }

}

module.exports = {
  sendTextMessage
};