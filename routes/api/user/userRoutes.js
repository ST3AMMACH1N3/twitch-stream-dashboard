const router = require('express').Router();
const { validateToken, refreshToken, respondToVerification } = require('../auth/authController');
const { addUser, updateFollowers, updateStream, unsubscribeFromEvents, getSubscriptions, removeUser } = require('../user/userController');
const globals = require('../../../config/globals');

router.get('/unsubscribe', (req, res) => {
    const { identifier } = req.cookies;
    if (identifier) {
        unsubscribeFromEvents(identifier);
        res.json({ msg: 'Unsubscribed' });
    }
})

router.get('/remove', (req, res) => {
    const { identifier } = req.cookies;
    if (identifier) {
        removeUser(identifier);
        res.json({ msg: 'User removed' });
    }
})

router.get('/refresh', async (req, res) => {
    const { identifier } = req.cookies;
    if (identifier && globals.users[identifier]) {
        let token = await refreshToken(globals.users[identifier].refresh_token);
        if (token) {
            globals.users[identifier].refresh_token = token.refresh_token;
            globals.users[identifier].access_token = token.access_token;
            addUser(globals.users[identifier]);
            return res.json({ msg: 'Token refreshed' });
        }
    }
    res.json({ msg: 'Could not refresh token' });
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