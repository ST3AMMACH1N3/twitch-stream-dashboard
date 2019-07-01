const db = require('../../../models');
const globals = require('../../../config/globals');
const axios = require('axios');
const subscriptionURL = 'https://api.twitch.tv/helix/webhooks/hub';
const myURL = process.env.MY_URL || 'http://localhost:3000';
const jwt = require('jsonwebtoken');
const errorHandler = require('../../../controllers/errorHandler');
const { getUserAuthCode, getUserAccessToken } = require('../auth/authController');
const { joinChannel, leaveChannel, getChannels } = require('../../../controllers/chat');
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, MY_URL } = process.env;
const baseAuthURL = 'https://id.twitch.tv/oauth2';

exports.findUser = identifier => {
    return db.User.findOne({
        where: {
            identifier
        }
    });
}

exports.upsertUser = user => {
    let { identifier } = user;
    return db.User.upsert(user, {
        where: {
            identifier
        }
    });
}

exports.authenticateUser = async (req, res) => {
    const code = getUserAuthCode(req);
    if (!code) {
        console.log('Code not recieved');
        return res.json({ msg: 'We were unable to get an authorization code.' });
    }
    const info = await getUserAccessToken(code);
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
    let created = await exports.addUser({ identifier: sub, preferred_username, refresh_token, access_token });
    if (created) {
        return res.redirect('/tutorial');
    }
    return res.redirect('/dashboard');
}

exports.addUser = user => {
    console.log('Adding user');
    let { identifier } = user;
    return db.User.findOrCreate({
        where: {
            identifier
        },
        defaults: user
    })
    .then(([dbUser, created]) => {
        if (globals.users[identifier]) {
            console.log('User is already loaded');
            return false;
        }
        let user = dbUser.get({ plain: true });
        globals.users[identifier] = user;
        let username = '#' + user.preferred_username.toLowerCase();
        Promise.all([
            user.analytics ? exports.subscribeToEvents(identifier) : null,
            user.chatbot ? joinChannel(username) : null
        ])
        .then(([analytics, chat]) => {
            console.log('Back from subscribing');
            analytics ? console.log(`Subscribed to analytics for ${user.preferred_username}`) : null;
            chat ? console.log(`Joined chat for ${user.preferred_username}`) : null;
        })
        .catch(err => {
            console.log(err);
        })
        return created;
    })
    .catch(err => console.log(err));
}

exports.removeUser = identifier => {
    if (!identifier || !globals.users[identifier]) {
        return;
    }
    let user = globals.users[identifier];
    let username = '#' + user.preferred_username.toLowerCase();
    Promise.all([
        exports.unsubscribeFromEvents(identifier),
        leaveChannel(username)
    ])
    .then(([analytics, chat]) => {
        analytics ? console.log(`Unsubscribed from analytics for ${user.preferred_username}`) : null;
        chat ? console.log(`Left chat for ${user.preferred_username}`) : null;
        console.log('Deleting reference');
        delete globals.users[identifier];
    })
    .catch(err => {
        console.log(err);
    })
}

exports.subscribeToEvents = (identifier, retry) => {
    console.log('Subscribing to events');
    if (!identifier || !globals.users[identifier]) {
        return console.log('User not found, cannot subscribe to events');
    }
    return exports.getSubscriptions()
        .then(response => {
            let subscriptions = response.data.data;
            let found = subscriptions.find(sub => {
                return sub.callback.includes(identifier);
            });
            if (found) {
                return console.log(`Already subscribed to events for ${globals.users[identifier].preferred_username}`);
            }
            const callback = `${myURL}/api/user`,
            mode = 'subscribe',
            subURL = 'https://api.twitch.tv/helix';
            const config = { headers: { Authorization: `Bearer ${globals.users[identifier].access_token}` } };
            return Promise.all([
                axios.post(subscriptionURL, { 'hub.callback': `${callback}/follows/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/users/follows?first=1&to_id=${identifier}`, 'hub.lease_seconds': 864000 }, config),
                axios.post(subscriptionURL, { 'hub.callback': `${callback}/subscriptions/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/subscriptions/events?broadcaster_id=${identifier}&first=1`, 'hub.lease_seconds': 864000 }, config),
                axios.post(subscriptionURL, { 'hub.callback': `${callback}/streamChange/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/streams?user_id=${identifier}`, 'hub.lease_seconds': 864000 }, config)
            ]);
        })
        .then(response => {
            if (!response) {
                return false;
            }
            return true;
        })
        .catch(err => {
            errorHandler(err, exports.subscribeToEvents, identifier, retry);
        });
    
}

exports.unsubscribeFromEvents = (identifier, retry) => {
    console.log('Unsubscribing from events');
    if (!identifier || !globals.users[identifier]) {
        return console.log('User not found, cannot unsubscribe from events');
    }
    return exports.getSubscriptions()
        .then(response => {
            let subscriptions = response.data.data;
            let found = subscriptions.find(sub => {
                return sub.callback.includes(identifier);
            });
            if (!found) {
                return console.log(`Not subscribed to events for ${globals.users[identifier] ? globals.users[identifier].preferred_username : 'user'}`);
            }
            const callback = `${myURL}/api/user`,
            mode = 'unsubscribe',
            subURL = 'https://api.twitch.tv/helix';
            const config = { headers: { Authorization: `Bearer ${globals.users[identifier].access_token}` } };
            return Promise.all([
                axios.post(subscriptionURL, { 'hub.callback': `${callback}/follows/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/users/follows?first=1&to_id=${identifier}` }, config),
                axios.post(subscriptionURL, { 'hub.callback': `${callback}/subscriptions/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/subscriptions/events?broadcaster_id=${identifier}&first=1` }, config),
                axios.post(subscriptionURL, { 'hub.callback': `${callback}/streamChange/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/streams?user_id=${identifier}` }, config)      
            ]);
        })
        .then(response => {
            if (!response) {
                return false;
            }
            return true;
        })
        .catch(err => {
            errorHandler(err, exports.unsubscribeFromEvents, identifier, retry);
        });
}

exports.getSubscriptions = () => {
    console.log('Getting subscriptions');
    const config = { headers: { Authorization: `Bearer ${globals.appAccessToken}` } };
    return axios.get('https://api.twitch.tv/helix/webhooks/subscriptions', config);
}

exports.updateFollows = (req, res) => {
    console.log('Follows updated');
    res.status(200).end();
}

exports.updateSubscriptions = (req, res) => {
    console.log('Subscriptions updated');
    res.status(200).end();
}

exports.updateStream = (req, res) => {
    console.log('Stream updated');
    res.status(200).end();
}

// exports.removeUser = identifier => {
//     console.log('Removing user');
//     if (identifier) {
//         let channels = getChannels();
//         let username = '#' + globals.users[identifier].preferred_username.toLowerCase();
//         Promise.all([
//             exports.getSubscriptions(),
//             channels.includes(username) ? leaveChannel(username) : null
//         ])
//         .then(([subscriptionResponse, chatResponse]) => {
//             let subscriptions = subscriptionResponse.data.data;
//             let found = subscriptions.find(sub => {
//                 return sub.callback.includes(identifier);
//             });
//             if (found) {
//                 return exports.unsubscribeFromEvents(identifier);
//             }
//         })
//         .then(response => {
//             if (response) {
//                 console.log(`Unsubscribed from events for ${identifier}`);
//             } else {
//                 console.log(`No subscriptions found for ${identifier}`);
//             }
//             delete globals.users[identifier];
//         })
//         .catch(async err => {
//             let token = await errorHandler(err, identifier);
//             if (token) {
//                 exports.unsubscribeFromEvents(identifier)
//                     .then(response => {
//                         delete globals.users[identifier];
//                         if (!response) {
//                             console.log(`No subscriptions found for ${identifier}`);
//                             return;
//                         }
//                         console.log(`Unsubscribed from events for ${identifier}`);
//                     })
//                     .catch(err => console.log(err));
//             }
//         });
//     }
// }