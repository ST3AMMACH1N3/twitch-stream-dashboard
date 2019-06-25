const router = require('express').Router();
const { validateToken, respondToVerification } = require('../auth/authController');
const { updateFollowers, updateStream, unsubscribeFromEvents, getSubscriptions } = require('../user/userController');

router.get('/unsubscribe', (req, res) => {
    const { identifier } = req.cookies;
    if (identifier) {
        unsubscribeFromEvents(identifier);
        res.json({ msg: 'Unsubscribed' });
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

router.route('/followers/:id')
        .get(respondToVerification)
        .post(updateFollowers);

router.route('/streamChange/:id')
        .get(respondToVerification)
        .post(updateStream);

module.exports = router;