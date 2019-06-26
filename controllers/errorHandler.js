const globals = require('../config/globals');
const { refreshToken, getAppAccessToken } = require('../routes/api/auth/authController');
const { addUser } = require('../routes/api/user/userController');

exports.errorHandler = async (err, identifier) => {
    if (!err.data || err.data.status != 401) {
        return console.log(err);
    }
    if (globals.users[identifier] && globals.users[identifier].refresh_token) {
        try {
            const token = await refreshToken(globals.users[identifier].refresh_token);
            globals.users[identifier].refresh_token = token.refresh_token;
            globals.users[identifier].access_token = token.access_token;
            addUser(globals.users[identifier])
                .then(created => console.log('User updated'))
                .catch(err => console.log(err));
            return { identifier, access_token: token.access_token };
        } catch(err) {
            console.log(err);
            return null;
        }
    } else if (!globals.users[identifiers]) {
        getAppAccessToken();
        return { identifier };
    } else {
        console.log(err);
        return null;
    }
}