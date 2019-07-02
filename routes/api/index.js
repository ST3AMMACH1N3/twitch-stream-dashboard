const router = require('express').Router();
const auth = require('./auth/authRoutes');
const user = require('./user/userRoutes');
const log = require('../../config/middleware/console');

// router.use(log);

router.use('/auth', auth);
router.use('/user', user);

module.exports = router;