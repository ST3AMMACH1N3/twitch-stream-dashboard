const tmi = require('tmi.js');
const globals = require('../config/globals');

const options = {
    identity: {
        username: 'STANbot',
        password: process.env.STANBOT_OAUTH
    }
}

const client = new tmi.client(options);

client.on('connected', connectedHandler);
client.on('message', messageHandler);
client.on('notice', noticeHandler);
client.connect();

function connectedHandler(addr, port) {
    console.log(`Connected to ${addr}:${port}`);
}

function messageHandler(channel, userstate, msg, self) {
    if (self) return;
    let command = msg.split(' ')[0];
    let isCommand = /!\w+/.test(command);
    if (!isCommand) {
        return;
    }
    command = command.slice(1).toLowerCase();
    switch (command) {
        case 'ping': {
            sayMessage(channel, 'Pong');
            break;
        }
        case 'say': {
            sayMessage(channel, msg.split(' ').slice(1).join(' '));
            break;
        }
    }
}

function sayMessage(channel, message) {
    client.say(channel, message)
        .then(data => {})
        .catch(err => console.log(err));
}

function noticeHandler(channel, msgid, msg) {
    console.log(`Channel: ${channel}`);
    console.log(`MessageId: ${msgid}`);
    console.log(`Message: ${msg}`);
}

exports.joinChannel = channel => {
    return client.join(channel);
}

exports.leaveChannel = channel => {
    return client.part(channel);
}

exports.getChannels = () => {
    return client.getChannels();
}