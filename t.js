const dgram = require('dgram');
const NodeRSA = require('node-rsa');
const _ = require('lodash');
const farmhash = require('farmhash');

const key = new NodeRSA();
const adb = require("./db");
const Player = require("./player");
const util = require("./util");

const udp = dgram.createSocket('udp4');
const players = {};


(async () => {
    const db = await adb
    const key_data = db.player.findOne({});
    let id;
    if (key_data) {
        key.importKey(key_data.pri, 'pkcs1');
        id = key_data.hash_id
        console.log('from db', typeof id, id)
    } else {
        key.generateKeyPair(2048);
        const pri = key.exportKey('pkcs1-private')
        const pub = key.exportKey('pkcs1-public')
        let hash_id = farmhash.fingerprint32(pri);
        id = hash_id
        // console.log('to db', id)
        db.player.insert({
            pri,
            pub,
            hash_id
        });
    }

    const message = Buffer.from('\x510000\x00');
    message.writeUInt32BE(id, 1)
    udp.send(message, 1979, 'localhost', (err) => {
        //   udp.close();
    });
    udp.on('message', (buff, rinfo) => {
        console.log(buff)
        const cmd = buff[0]
        handle_msg(cmd, buff.slice(1))

    })
    udp.on('close', () => {
        console.log('Client UDP socket closed : BYE!')
    });
    return 'done'
})()

function handle_msg(cmd, data) {
    switch (cmd) {
        case 0:
            const peers = _.chunk(data, 4)
            console.log(peers)
            _.each(peers, tid => {
                const pid = util.b2s(tid)
                players[pid] = new Player(udp, id, tid, players)
            })
            break;
    }
    udp.close();
}