const router = require('express').Router();
const auth = require('./auth/authRoutes');
const user = require('./user/userRoutes');

router.use('/auth', auth);
router.use('/user', user);

module.exports = router;