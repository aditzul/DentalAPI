const axios = require('axios');
const SettingsController = require('./SettingsController');
const ResponseHandler = require ('../Others/ResponseHandler')

async function getApiKeyAndSenderId() {
    try {
        const { data } = await SettingsController.getSMSOSettings();
        
        const apiKey = data[0][0].SMSO_API_KEY;
        const senderID = data[0][0].SMSO_SENDER_ID;

        return { apiKey, senderID };
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getSmsSendersWithApiKey() {
    try {
        const { apiKey } = await getApiKeyAndSenderId();
        const response = await axios.get('https://app.smso.ro/api/v1/senders', {
            headers: {
                'X-Authorization': apiKey
            }
        });

        return response.data;
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function sendSMS(to, message) {
    try {
        const { senderID, apiKey } = await getApiKeyAndSenderId();

        const postData = {
            to: to,
            sender: senderID,
            body: message
        };

        const headers = {
            'X-Authorization': apiKey
        };

        const response = await axios.post('https://app.smso.ro/api/v1/send', postData, { headers });
        return ResponseHandler(200, null, response.data, null)

    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

module.exports = {
    getSmsSendersWithApiKey: getSmsSendersWithApiKey,
    sendSMS: sendSMS,
};
