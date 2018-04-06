const dgram = require('dgram');
const NodeRSA = require('node-rsa');
const _ = require('lodash');
const farmhash = require('farmhash');

const message = Buffer.from('\x5100000000\x00');

const key = new NodeRSA();
const adb = require("./db");
(async ()=> {
    const db = await adb
    const key_data = db.player.findOne({});
    let id;
    if(key_data){
        key.importKey(key_data.pri, 'pkcs1');
        id = key_data.hash_id
        console.log('from db', id)
    } else {
        key.generateKeyPair(2048);
        const pri = key.exportKey('pkcs1-private')
        const pub = key.exportKey('pkcs1-public')
        let hash_id = farmhash.fingerprint32(pri);
        id = hash_id
        db.player.insert({
            pri,
            pub,
            hash_id
        });
    }
    // const client = dgram.createSocket('udp4');
    // client.send(message, 1979, 'localhost', (err) => {
    //     //   client.close();
    // });
    // client.on('message', (msg, rinfo) => {
    //     console.log(msg)
    //     const peers = _.chunk(msg, 8)
    //     console.log(peers)
    //     client.close();
    // })
    return 'done'
})()
