const router = require('express').Router();
const { authenticateUser } = require('./authController');

router.get('/', authenticateUser);

module.exports = router;