const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('*', (req, res) => {
    res.render('404');
});

module.exports = router;