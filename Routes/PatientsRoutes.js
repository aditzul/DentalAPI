const express = require('express');
const router = express.Router();
const PatientsController = require('../Controllers/PatientsController');

router.route('/GetAllPatients').get((request, response) => {
    PatientsController.getAllPatients().then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/GetAllPatientsByMedicID/:ID').get((request, response) => {
    PatientsController.getAllPatientsByMedicID(request.params.ID).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/GetPatient/:ID').get((request, response) => {
    PatientsController.getPatient(request.params.ID).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/AddPatient').post((request, response) => {
    let patient = { ...request.body };
    PatientsController.addPatient(patient).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/UpdatePatient/:ID').put((request, response) => {
    const ID = request.params.ID;
    const updates = request.body;

    PatientsController.updatePatient(ID, updates).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/DeletePatient/:ID').delete((request, response) => {
    const ID = request.params.ID;
    PatientsController.deletePatient(ID).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

module.exports = router;