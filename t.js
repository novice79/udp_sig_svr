const dgram = require('dgram');
const NodeRSA = require('node-rsa');
const _ = require('lodash');
const loki = require('lokijs')
const lfsa = require('lokijs/src/loki-fs-structured-adapter');
const message = Buffer.from('\x5100000000\x00');

const key = new NodeRSA();
var adapter = new lfsa();
const db = new loki('freeland.db', { 
    adapter : adapter,
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true, 
    autosaveInterval: 4000
  })
const users = db.addCollection('users');

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