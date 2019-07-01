const router = require('express').Router();
const globals = require('../../../config/globals');
const { validateToken } = require('./authController');
const { authenticateUser } = require('../user/userController');

router.get('/', authenticateUser);

router.get('/validate', (req, res) => {
    validateToken(globals.appAccessToken);
    res.redirect('/dashboard');
});

module.exports = router;