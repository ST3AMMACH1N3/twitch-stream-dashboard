const db = require('../../../models');
const globals = require('../../../config/globals');
const axios = require('axios');
const subscriptionURL = 'https://api.twitch.tv/helix/webhooks/hub';
const myURL = process.env.MY_URL || 'http://localhost:3000';

exports.addUser = user => {
    console.log('Adding user');
    const { identifier } = user;
    if (identifier) {
        if (!globals.users[identifier]) {
            exports.getSubscriptions()
            .then(response => {
                console.log(response.data.total);
                let found = response.data.data.find(sub => {
                    return (sub.callback.includes(identifier));
                });
                if (!found) {
                    exports.subscribeToEvents(identifier);
                }
            })
            .catch(err => console.log(err));
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
    if (identifier && globals.users[identifier]) {
        delete global.users[identifier];
    } 
}

exports.subscribeToEvents = identifier => {
    console.log('Subscribing to events');
    if (identifier && globals.users[identifier]) {
        const callback = `${myURL}/api/user`,
              mode = 'subscribe',
              subURL = 'https://api.twitch.tv/helix';
        const config = { headers: { Authorization: `Bearer ${globals.users[identifier].access_token}` } };
        Promise.all([
            axios.post(subscriptionURL, { 'hub.callback': `${callback}/followers/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/users/follows?first=1&to_id=${identifier}`, 'hub.lease_seconds': 864000 }, config),
            axios.post(subscriptionURL, { 'hub.callback': `${callback}/streamChange/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/streams?user_id=${identifier}`, 'hub.lease_seconds': 864000 }, config)
        ])
        .then(([followResponse, streamResponse]) => {
            if (followResponse.status >= 200 && followResponse.status < 300) {
                console.log('Follows subscription request sent');
            } else {
                console.log('Failed to Subscribe to follows');
            }
            if (streamResponse.status >= 200 && streamResponse.status < 300) {
                console.log('Stream change subscription request sent');
            } else {
                console.log('Failed to Subscribe to stream changes');
            }
        })
        .catch(err => console.log(err));
    }
}

exports.unsubscribeFromEvents = identifier => {
    console.log('Unsubscribing from events');
    if (identifier && globals.users[identifier]) {
        const callback = `${myURL}/api/user`,
              mode = 'unsubscribe',
              subURL = 'https://api.twitch.tv/helix';
        const config = { headers: { Authorization: `Bearer ${globals.users[identifier].access_token}` } };
        Promise.all([
            axios.post(subscriptionURL, { 'hub.callback': `${callback}/followers/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/users/follows?first=1&to_id=${identifier}` }, config),
            axios.post(subscriptionURL, { 'hub.callback': `${callback}/streamChange/${identifier}`, 'hub.mode': mode, 'hub.topic': `${subURL}/streams?user_id=${identifier}` }, config)
        ])
        .then(([followResponse, streamResponse]) => {
            if (followResponse.status >= 200 && followResponse.status < 300) {
                console.log('Unsubscribing from follows');
            } else {
                console.log('Failed to Subscribe to follows');
            }
            if (streamResponse.status >= 200 && streamResponse.status < 300) {
                console.log('Unsubscribing from stream changes');
            } else {
                console.log('Failed to Subscribe to stream changes');
            }
        })
        .catch(err => console.log(err));
    }
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