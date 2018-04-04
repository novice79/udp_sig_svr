const dgram = require('dgram');
const NodeRSA = require('node-rsa');
const _ = require('lodash');
const message = Buffer.from('\x5100000000\x00');
const client = dgram.createSocket('udp4');
client.send(message, 1979, 'localhost', (err) => {
//   client.close();
});
client.on('message', (msg, rinfo) => {
    console.log(msg)
    const peers = _.chunk(msg, 8)
    console.log(peers)
    client.close();
})