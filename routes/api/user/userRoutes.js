const router = require('express').Router();
const { validateToken, refreshToken, respondToVerification } = require('../auth/authController');
const { addUser, updateFollowers, updateStream, unsubscribeFromEvents, getSubscriptions, removeUser } = require('../user/userController');
const { joinChannel, leaveChannel } = require('../../../controllers/chat');
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

router.route('/followers/:id')
        .get(respondToVerification)
        .post(updateFollowers);

router.route('/streamChange/:id')
        .get(respondToVerification)
        .post(updateStream);

router.get('/join', (req, res) => {
    joinChannel('ST3AM_MACH1N3');
    res.redirect('/dashboard');
});

router.get('/leave', (req, res) => {
    leaveChannel('ST3AM_MACH1N3');
    res.redirect('/dashboard');
});

module.exports = router;