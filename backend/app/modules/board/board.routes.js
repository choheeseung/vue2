const router = require('express').Router();
const controller = loadModule('board', 'controller');

router.get('/:boardKey', controller.getBoardInfo);
router.get('/:boardKey/posts', controller.getPostList);
router.get('/:boardKey/posts/:postId/comments', controller.getPostList);
router.get('/:boardKey/posts/:postId', controller.getPost);

module.exports = router;