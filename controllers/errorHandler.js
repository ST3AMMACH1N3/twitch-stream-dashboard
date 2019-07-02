const globals = require('../config/globals');
const { refreshToken, getAppAccessToken, validateToken } = require('../routes/api/auth/authController')

module.exports = errorHandler = async (err, callback, ...args) => {
    console.log(err.response.data);
    if (!err.response.data || err.response.data.status != 401 || args[args.length - 1]) {
        return console.log(err);
    }
    try { 
        if (args[0] && globals.users[args[0]]) {
            let newToken = await refreshToken(globals.users[args[0]].refresh_token);
            if (newToken && newToken.refresh_token && newToken.access_token) {
                console.log('New token aquired, trying again');
                globals.users[args[0]].refresh_token = newToken.refresh_token;
                globals.users[args[0]].access_token = newToken.access_token;
                console.log(globals.users[args[0]]);
                args[args.length - 1] = true;
                return callback(...args);
            }
            console.log('Did not recieve new token')
            console.log(err);
        } else {
            let needAppToken = await validateToken(globals.appAccessToken);
            if (needAppToken) {
                globals.appAccessToken = await getAppAccessToken();
            } else {
                console.log('App access token is valid, but not given an identifier');
                console.log(err);
            }
        } 

    } catch(err) {
        console.log(err);
    }
}