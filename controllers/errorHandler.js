const globals = require('../config/globals');
const { refreshToken, getAppAccessToken, validateToken } = require('../routes/api/auth/authController')

module.exports = errorHandler = (err, callback, ...args) => {
    if (!err.response.data || err.response.data.status != 401 || args[args.length - 1]) {
        return console.log(err);
    }
    let needAppToken = validateToken(globals.appAccessToken);
    if (needAppToken) {
        globals.appAccessToken = getAppAccessToken();
    } else if (args[0] && globals.users[args[0]]) {
        let newToken = refreshToken(globals.users[args[0].refresh_token]);
        if (newToken && newToken.refresh_token && newToken.access_token) {
            console.log('New token aquired, trying again');
            globals.users[args[0]].refresh_token = newToken.refresh_token;
            globals.users[args[0]].access_token = newToken.access_token;
            args[args.length - 1] = true;
            return callback(...args);
        }
        console.log('Did not recieve new token')
        console.log(err);
    } else {
        console.log('App access token is valid, but not given an identifier');
        console.log(err);
    }
}