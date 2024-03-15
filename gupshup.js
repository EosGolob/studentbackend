// gupshup.js
const axios = require('axios');

async function sendWhatsAppMessage(message) {
    try {
        const response = await axios.post('https://api.gupshup.io/sm/api/v1/msg', {
            channel: 'whatsapp',
            source: '+917834811114',
            destination: '+918603735691',
            'src.name': 'Your App',
            message: message,
            apiKey: 'etdnk32cmakq3bgmfvg49b6kshmbrumq'
        });

        console.log('WhatsApp message sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
}

module.exports = { sendWhatsAppMessage };
