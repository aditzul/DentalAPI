const express = require('express');
const router = express.Router();
const AppointmentsController = require('../Controllers/AppointmentsController');

router.route('/GetAllAppointmentsByPatientID/:ID').get((request, response) => {
    AppointmentsController.getAllAppointmentsByPatientID(request.params.ID).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/GetAllAppointmentsByMedicID/:ID').get((request, response) => {
    AppointmentsController.getAllAppointmentsByMedicID(request.params.ID).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/GetAllAppointments').get((request, response) => {
    AppointmentsController.getAllAppointments().then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/AddAppointment').post((request, response) => {
    let appointment = { ...request.body };
    AppointmentsController.addAppointment(appointment).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/UpdateAppointment/:ID').put((request, response) => {
    const ID = request.params.ID;
    const updates = request.body;

    AppointmentsController.updateAppointment(ID, updates).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/DeleteAppointment/:ID').delete((request, response) => {
    const ID = request.params.ID;
    AppointmentsController.deleteAppointment(ID).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/GetLastID').get((request, response) => {
    AppointmentsController.getLastAppointmentID().then(result => {
        response.status(result.status)
        response.json(result);
    })
});

module.exports = router;