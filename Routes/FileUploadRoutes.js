const express = require('express');
const router = express.Router();
const FileUploadController = require('../Controllers/FileUploadController');

router.route('/UploadDocument').post((request, response) => {
    FileUploadController.uploadDocument(request, response)
        .then(result => {
            response.status(result.status);
            response.json(result);
        })
});

router.route('/GetFilesList/:ID').get((request, response) => {
    FileUploadController.getFilesList(request, response)
});

// router.route('/GetFilesList/:ID').get((request, response) => {
//     FileUploadController.getFilesList(request, response)
//     .then(result => {
//         response.status(result.status);
//         response.json(result);
//     })
// });

module.exports = router;