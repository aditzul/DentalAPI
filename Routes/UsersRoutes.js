const express = require('express');
const router = express.Router();
const UsersController = require('../Controllers/UsersController');

router.route('/GetAllUsers').get((request, response) => {
    UsersController.getAllUsers().then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/GetAllMedics').get((request, response) => {
    UsersController.getAllMedics().then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/GetUser/:ID').get((request, response) => {
    UsersController.getUser(request.params.ID).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

router.route('/AddUser').post((request, response) => {
    let user = { ...request.body };
    UsersController.addUser(user).then(result => {
        response.status(result.status)
        response.json(result);
    })
});


router.route('/DeleteUser/:ID').delete((request, response) => {
    const ID = request.params.ID;
    UsersController.deleteUser(ID).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/UpdateUser/:ID').put((request, response) => {
    const ID = request.params.ID;
    const updates = request.body;

    UsersController.updateUser(ID, updates).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/GetLastUserID').get((request, response) => {
    UsersController.getLastUserID().then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/Login').post((request, response) => {
    const { username, password } = request.body;
    UsersController.Login(username, password).then(result => {
        response.status(result.status) 
        response.json(result);
    })
});

module.exports = router;
