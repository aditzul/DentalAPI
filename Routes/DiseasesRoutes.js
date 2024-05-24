const express = require('express');
const router = express.Router();
const DiseasesController = require('../Controllers/DiseasesController');

router.route('/GetAllDiseases').get((request, response) => {
    DiseasesController.getAllDiseases().then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/AddDisease').post((request, response) => {
    let body = { ...request.body };
    DiseasesController.addDisease(body).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/DeleteDisease/:ID').delete((request, response) => {
    const ID = request.params.ID;
    DiseasesController.deleteDisease(ID).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

module.exports = router;