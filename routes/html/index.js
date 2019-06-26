const router = require('express').Router();
const db = require('../../models');
const globals = require('../../config/globals');
const myURL = process.env.MY_URL || 'http://localhost:3000';
const signedIn = require('../../config/middleware/signedIn');

router.get('/', (req, res) => {
    const { identifier } = req.cookies;
    if (identifier) {
        db.User.findOne({
            where: {
                identifier
            }
        })
        .then(user => {
            if (user) {
                globals.users[identifier] = user.get({ plain: true });
            }
        })
        .catch(err => {
            console.log(err);
        })
        return res.redirect('/dashboard');
    }
    res.render('index');
});

router.get('/signin', (req, res) => {
    const { TWITCH_CLIENT_ID } = process.env;
    const redirectURI = `${myURL}/api/auth`;
    const scope='openid';
    res.redirect(`https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${redirectURI}&response_type=code&scope=${scope}`);
})

router.get('/dashboard', signedIn, (req, res) => {
    res.render('dashboard');
})

router.get('/tutorial', signedIn, (req, res) => {
    res.render('tutorial');
})

router.get('*', (req, res) => {
    res.render('404');
});

module.exports = router;