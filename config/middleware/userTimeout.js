const globals = require('../globals');

module.exports = (req, res, next) => {
    const { identifier } = req.cookies;
    if (identifier && globals.users[identifier]) {
        clearTimeout(globals.users[identifier].timer);
        globals.users[identifier].timer = setTimeout(() => {
            delete users[identifier];
        },  60 * 60 * 1000);
    }
}