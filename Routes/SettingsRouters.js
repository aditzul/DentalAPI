const express = require('express');
const router = express.Router();
const SettingsController = require('../Controllers/SettingsController');

router.route('/GetSMSOSettings').get((request, response) => {
    SettingsController.getSMSOSettings().then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/GetSMSSettings').get((request, response) => {
    SettingsController.getSMSSettings().then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/GetCompanySettings').get((request, response) => {
    SettingsController.getCompanySettings().then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/UpdateSettings').put((request, response) => {
    const updates = request.body;
    SettingsController.updateSettings(updates).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

module.exports = router;