const router = require('express').Router();

router.get('/', (req, res) => {
    if (req.cookies.identifier) {
        return res.redirect('/dashboard');
    }
    res.render('index');
});

router.get('/signin', (req, res) => {
    const { TWITCH_CLIENT_ID } = process.env;
    const redirectURI = 'http://localhost:3000/api/auth';
    const scope='openid';
    res.redirect(`https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${redirectURI}&response_type=code&scope=${scope}`);
})

router.get('*', (req, res) => {
    res.render('404');
});

module.exports = router;