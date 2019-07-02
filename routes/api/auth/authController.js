const axios = require('axios');
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, MY_URL } = process.env;
const myURL = MY_URL || 'http://localhost:3000';
const redirectURI = `${myURL}/api/auth`;
const baseAuthURL = 'https://id.twitch.tv/oauth2';

exports.getAppAccessToken = async () => {
    const url = `${baseAuthURL}/token`;
    const grantType = 'client_credentials';
    try {
        let response = await axios.post(`${url}?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=${grantType}`);
        return response.data.access_token;
    } catch(err) {
        return console.log(err);
    }
}

exports.getUserAuthCode = req => {
    const { code } = req.query;
    if (code && typeof code == 'string') {
        return code;
    }
    return null;
}

exports.getUserAccessToken = code => {
    const url = `${baseAuthURL}/token`;
    const grantType = 'authorization_code';
    return axios
            .post(`${url}?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&code=${code}&grant_type=${grantType}&redirect_uri=${redirectURI}`)
            .then(response => {
                if (response.status == 200) {
                    return response.data;
                }
                return null;
            })
            .catch(err => {
                console.log(err);
                return null;
            })
}

exports.revokeAccessToken = token => {
    const url = `${baseAuthURL}/revoke`;
    axios
        .post(`${url}?client_id=${TWITCH_CLIENT_ID}&token=${token}`)
        .then(response => console.log('Access token revoked'))
        .catch(err => console.log(err));
}

exports.refreshToken = async refreshToken => {
    const url = `${baseAuthURL}/token`;
    const grantType = 'refresh_token';
    console.log('Refreshing token');
    try {
        const response =  await axios.post(`${url}?grant_type=${grantType}&refresh_token=${refreshToken}&client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}`)
        if (response.status == 200) {
            console.log('Got refresh response');
            console.log(response.data);
            return response.data;
        }
        return console.log('Could not refresh token');
    } catch (err) {
        return console.log(err);
    }
}

exports.validateToken = async accessToken => {
    try {
        await axios.get(`${baseAuthURL}/validate`, { headers: { Authorization: `OAuth ${accessToken}` } });
        return true;
    } catch (err) {
        return false;
    }
}

exports.respondToVerification = (req, res) => {
    console.log('Responding to verification');
    res.status(200).send(req.query['hub.challenge']);
}