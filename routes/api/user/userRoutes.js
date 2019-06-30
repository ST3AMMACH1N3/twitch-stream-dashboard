const router = require('express').Router();
const { validateToken, refreshToken, respondToVerification } = require('../auth/authController');
const { addUser, updateFollows, updateSubscriptions, updateStream, unsubscribeFromEvents, getSubscriptions, removeUser } = require('../user/userController');
const globals = require('../../../config/globals');

router.get('/remove', (req, res) => {
    const { identifier } = req.cookies;
    if (identifier) {
        unsubscribeFromEvents(identifier);
        removeUser(identifier);
        res.json({ msg: 'User removed' });
    }
})

router.get('/subscriptions', (req, res) => {
    getSubscriptions()
    .then(response => {
        console.log(response.data);
        res.json(response.data);
    })
    .catch(err => console.log(err));
})

router.route('/follows/:id')
        .get(respondToVerification)
        .post(updateFollows);

router.route('/subscriptions/:id')
        .get(respondToVerification)
        .post(updateSubscriptions);

router.route('/streamChange/:id')
        .get(respondToVerification)
        .post(updateStream);

module.exports = router;