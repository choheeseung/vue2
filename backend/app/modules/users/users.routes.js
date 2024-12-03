const router = require('express').Router();

const controller = loadModule('users', 'controller');

router.post('/', controller.userRegister);
router.post('/authorize/phone', controller.phoneAuth);
router.get('/', controller.getInfo);
router.post('/authorize', controller.authorize);
router.post('/authorize/token', controller.refreshToken);

module.exports = router;