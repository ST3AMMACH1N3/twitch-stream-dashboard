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
            addUser(user.get({ plain: true }));
        } catch(err) {
            return console.log(err);
        }
    }
    next();
}