// CommentRoute.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/add', commentController.requireAuth, commentController.addComment);
router.post('/delete/:id', commentController.requireAuth, commentController.deleteComment);

module.exports = router;
