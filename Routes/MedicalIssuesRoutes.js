const express = require('express');
const router = express.Router();
const MedicalIssuesController = require('../Controllers/MedicalIssuesController');

router.route('/GetAllIssues').get((request, response) => {
    MedicalIssuesController.getAllIssues().then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/AddIssue').post((request, response) => {
    let body = { ...request.body };
    MedicalIssuesController.addIssue(body).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/DeleteIssue/:ID').delete((request, response) => {
    const ID = request.params.ID;
    MedicalIssuesController.deleteIssue(ID).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

module.exports = router;