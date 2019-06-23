const axios = require('axios');
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;
const redirectURI = 'http://localhost:3000/api/auth';
const baseAuthURL = 'https://id.twitch.tv/oauth2';
const jwt = require('jsonwebtoken');
const { addUser } = require('../../api/user/userController');

exports.getAppAccessToken = () => {
    const url = `${baseAuthURL}/token`;
    const grantType = 'client_credentials';
    axios
        .post(`${url}?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=${grantType}`)
        .then(response => {
            console.log(response);
        })
        .catch(err => console.log(err));
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

exports.authenticateUser = async (req, res) => {
    const code = exports.getUserAuthCode(req);
    if (!code) {
        console.log('Code not recieved');
        return res.json({ msg: 'We were unable to get an authorization code.' });
    }
    const info = await exports.getUserAccessToken(code);
    if (!info) {
        console.log('Access token not recieved');
        return res.json({ msg: 'We were unable to get an access token' });
    }
    const { access_token, id_token, refresh_token } = info;
    const { aud, iss, sub, preferred_username } = jwt.decode(id_token);
    if (aud != TWITCH_CLIENT_ID || iss != baseAuthURL) {
        console.log('Id token not verified');
        return res.json({ msg: 'The token we recieved could not be verified' });
    }
    res.cookie('identifier', sub);
    let created = await addUser({ identifier: sub, preferred_username, refresh_token });
    if (created) {
        return res.redirect('/tutorial');
    }
    return res.redirect('/dashboard');
}

exports.revokeAccessToken = token => {
    const url = `${baseAuthURL}/revoke`;
    axios
        .post(`${url}?client_id=${TWITCH_CLIENT_ID}&token=${token}`)
        .then(response => console.log('Access token revoked'))
        .catch(err => console.log(err));
}

exports.refreshToken = (refreshToken, accessToken) => {
    const url = `${baseAuthURL}/token--data-urlencode`;
    const grantType = 'refresh_token';
    axios
        .post(`${url}?grant_type=${grantType}&refresh_token=${refreshToken}&client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}`)
        .then(response => {
            if (response.status == 200) {
                
            }
        })
        .catch(err => {
            console.log(err);
        })
}