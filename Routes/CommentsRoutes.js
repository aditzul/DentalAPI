const express = require('express');
const router = express.Router();
const CommentsController = require('../Controllers/CommentsController');

router.route('/GetAllCommentsByPatientID/:ID').get((request, response) => {
    CommentsController.getAllCommentsByPatientID(request.params.ID).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/AddComment').post((request, response) => {
    let comment = { ...request.body };
    CommentsController.addComment(comment).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

router.route('/DeleteComment/:ID').delete((request, response) => {
    const ID = request.params.ID;
    CommentsController.deleteComment(ID).then(result => {
        response.status(result.status)
        response.json(result);
    })
});

module.exports = router;