const express = require('express');
const router = express.Router();
const SMSOController = require('../Controllers/SMSOController.js');

router.route('/SMS-Senders').get((request, response) => {
    SMSOController.getSmsSendersWithApiKey().then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/SendSMS').post((request, response) => {
    const { to, message } = request.body;
    SMSOController.sendSMS(to, message).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

module.exports = router;