const tmi = require('tmi.js');
const client = new tmi.client();

client.on('connected', connectedHandler);
client.on('message', messageHandler);
client.connect();

function connectedHandler(addr, port) {
    console.log(`Connected to ${addr}:${port}`);
}

function messageHandler(target, context, msg, self) {
    if (msg.toLowerCase() === 'ping') {
        client.say(target, 'Pong')
            .then(data => {

            })
            .catch(err => console.log(err));
    }
    // console.log(`Target: ${target}`);
    // console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    // console.log(`Msg: ${msg}`);
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