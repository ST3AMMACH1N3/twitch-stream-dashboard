const db = require('../../../models');
const globals = require('../../../config/globals');
const axios = require('axios');
const subscriptionURL = 'https://api.twitch.tv/helix/webhooks/hub';
const myURL = process.env.MY_URL || 'http://localhost:3000';
const errorHandler = require('../../../controllers/errorHandler');

exports.addUser = user => {
    console.log('Adding user');
    const { identifier } = user;
    if (identifier) {
        if (!globals.users[identifier]) {
            exports.getSubscriptions()
                .then(response => {
                    console.log(response.data.total);
                    return  response.data.data.find(sub => {
                        return (sub.callback.includes(identifier));
                    });
                })
                .then(found => {
                    if (!found) {
                        return exports.subscribeToEvents(identifier)
                    }
                    return null;
                })
                .then(response => {
                    if (!response) {
                        console.log(`Already subscribed to events for ${identifier}`);
                        return;
                    }
                    console.log(`Subscribed to events for ${identifier}`);
                })
                .catch(async err => {
                    let token = await errorHandler(err, identifier);
                    if (token) {
                        exports.subscribeToEvents(identifier)
                            .then(response => {
                                if (!response) {
                                    console.log(`Already subscribed to events for ${identifier}`);
                                    return;
                                }
                                console.log(`Subscribed to events for ${identifier}`);
                            })
                            .catch(err => console.log(err));
                    }
                });
        }
        globals.users[identifier] = user;
    }
    
    return db.User.upsert(user, {
        where: {
            identifier: user.identifier
        }
    });
}

exports.removeUser = identifier => {
    console.log('Removing user');
    if (identifier) {
        exports.getSubscriptions()
            .then(response => {
                console.log(response.data.total);
                return  response.data.data.find(sub => {
                    return (sub.callback.includes(identifier));
                });
            })
            .then(found => {
                if (found) {
                    return exports.unsubscribeFromEvents(identifier);
                }
                return null;
            })
            .then(response => {
                delete globals.users[identifier];
                if (!response) {
                    console.log(`No subscriptions found for ${identifier}`);
                    return;
                }
                console.log(`Unsubscribed from events for ${identifier}`);
            })
            .catch(async err => {
                let token = await errorHandler(err, identifier);
                if (token) {
                    exports.unsubscribeFromEvents(identifier)
                        .then(response => {
                            delete globals.users[identifier];
                            if (!response) {
                                console.log(`No subscriptions found for ${identifier}`);
                                return;
                            }
                            console.log(`Unsubscribed from events for ${identifier}`);
                        })
                        .catch(err => console.log(err));
                }
            });
    }
}

exports.subscribeToEvents = function(identifier) {
    console.log('Subscribing to events');
    if (identifier && globals.users[identifier]) {
        const callback = `${myURL}/api/user`,
              mode = 'subscribe',
              subURL = 'https://api.twitch.tv/helix';
        const config = { headers: { Authorization: `Bearer ${globals.users[identifier].access_token}` } };
        return Promise.all([
            axios.post(subscriptionURL, { 'hub.callback': `${callback}/followers/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/users/follows?first=1&to_id=${identifier}`, 'hub.lease_seconds': 864000 }, config),
            axios.post(subscriptionURL, { 'hub.callback': `${callback}/streamChange/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/streams?user_id=${identifier}`, 'hub.lease_seconds': 864000 }, config)
        ]);
    }
    return new Promise((resolve, reject) => reject({ msg: 'User not found', action: `Subscribe to user: ${identifier}` }));
}

exports.unsubscribeFromEvents = function(identifier) {
    console.log('Unsubscribing from events');
    if (identifier && globals.users[identifier]) {
        const callback = `${myURL}/api/user`,
              mode = 'unsubscribe',
              subURL = 'https://api.twitch.tv/helix';
        const config = { headers: { Authorization: `Bearer ${globals.users[identifier].access_token}` } };
        return Promise.all([
            axios.post(subscriptionURL, { 'hub.callback': `${callback}/followers/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/users/follows?first=1&to_id=${identifier}` }, config),
            axios.post(subscriptionURL, { 'hub.callback': `${callback}/streamChange/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/streams?user_id=${identifier}` }, config)
        ]);
    }
    return new Promise((resolve, reject) => reject({ msg: 'User not found', action: `Unsubscribe from user: ${identifier}` }));
}

exports.getSubscriptions = () => {
    console.log('Getting subscriptions');
    const config = { headers: { Authorization: `Bearer ${globals.appAccessToken}` } };
    return axios.get('https://api.twitch.tv/helix/webhooks/subscriptions', config);
}

exports.updateFollowers = (req, res) => {
    console.log('Followers updated');
    res.status(200).end();
}

exports.updateStream = (req, res) => {
    console.log('Stream updated');
    res.status(200).end();
}