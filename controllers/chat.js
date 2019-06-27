const WebSocket = require('ws');
const url = 'wss://irc-ws.chat.twitch.tv:443';

const ws = new WebSocket(url);
ws.on('open', handleOpen);
ws.on('message', handleMessage);
ws.on('ping', handlePing);
ws.on('close', handleClose);
ws.on('error', handleError);

function handleOpen() {
    console.log('Successfully Connected to twitch chat');
}

function handleMessage(data) {
    console.log(data);
}

function handlePing(data) {
    console.log('Ping');
    console.log(data)
}

function handleClose(code, reason) {
    console.log('Disconnected');
    console.log(code, reason);
}

function handleError(error) {
    console.log('Error');
    console.log(error);
}

exports.joinChannel = channel => {
    ws.send(`JOIN #${channel}`);
}

exports.leaveChannel = channel => {
    ws.send(`PART #${channel}`);
}