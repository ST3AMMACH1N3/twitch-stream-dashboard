const globals = require('../globals');
const { addUser, findUser } = require('../../routes/api/user/userController');

module.exports = async (req, res, next) => {
    const { identifier } = req.cookies;
    if (!identifier) {
        return res.redirect('/');
    }
    if (!globals.users[identifier]) {
        try {
            let user = await findUser(identifier);
            if (!user) {
                res.clearCookie('identifier');
                res.redirect('/');
                return console.log(`User ${identifier} has cookie but is not in the database`);
            }
            let created = await addUser(user.get({ plain: true }));
            next();
        } catch(err) {
            res.status(500).send(err);
            return console.log(err);
        }
    } else {
        next();
    }
}