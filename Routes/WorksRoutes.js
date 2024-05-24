const express = require('express');
const router = express.Router();
const WorksController = require('../Controllers/WorksController');

router.route('/GetAllWorks').get((request, response) => {
    WorksController.getAllWorks().then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/AddWork').post((request, response) => {
    let body = { ...request.body };
    WorksController.addWork(body).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/DeleteWork/:ID').delete((request, response) => {
    const ID = request.params.ID;
    WorksController.deleteWork(ID).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

module.exports = router;