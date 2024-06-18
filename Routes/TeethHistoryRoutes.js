const express = require('express');
const router = express.Router();
const TeethHistoryController = require('../Controllers/TeethHistoryController');

router.route('/GetTeethHistory/:ID/:tooth_id').get((request, response) => {
    TeethHistoryController.getTeethHistory(request.params.ID, request.params.tooth_id).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/GetTeethHistoryByPatientID/:ID').get((request, response) => {
    TeethHistoryController.getTeethHistoryByPatientID(request.params.ID).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/AddTeethHistory').post((request, response) => {
    let body = { ...request.body };
    TeethHistoryController.addTeethHistory(body).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/UpdateTeethHistory/:ID').put((request, response) => {
    const ID = request.params.ID;
    const updates = request.body;

    TeethHistoryController.updateTeethHistory(ID, updates).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/DeleteTeethHistory/:ID').delete((request, response) => {
    const ID = request.params.ID;
    TeethHistoryController.deleteTeethHistory(ID).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

module.exports = router;