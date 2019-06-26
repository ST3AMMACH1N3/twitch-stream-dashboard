const router = require('express').Router();
const globals = require('../../../config/globals');
const { authenticateUser, validateToken } = require('./authController');

router.get('/', authenticateUser);

router.get('/validate', (req, res) => {
    validateToken(globals.appAccessToken);
    res.redirect('/dashboard');
});

module.exports = router;