const router = require('express').Router();
const auth = require('./auth/authRoutes');

router.use('/auth', auth);

module.exports = router;