const dgram = require('dgram');
const NodeRSA = require('node-rsa');
const _ = require('lodash');
const farmhash = require('farmhash');
const isBuffer = require('is-buffer')
const key = new NodeRSA();
const adb = require("./db");
const Player = require("./player");
const util = require("./util");

const udp = dgram.createSocket('udp4');
const server_name = 'localhost';
udp.post = (buff)=>{
    udp.send(buff, 1979, server_name, (err) => {

    });
}
const players = {};

let myid;
function heart_beat(){
    const span = _.random(10, 59) * 1000;
    setTimeout(()=>{
        const ping = Buffer.from('\x510000\x04');
        ping.writeUInt32BE(myid, 1)
        udp.post(ping);
    }, span)    
}
(async () => {
    const db = await adb
    const key_data = db.player.findOne({});

    if (key_data) {
        key.importKey(key_data.pri, 'pkcs1');
        myid = key_data.hash_id
        console.log('from db', typeof myid, myid)
    } else {
        key.generateKeyPair(2048);
        const pri = key.exportKey('pkcs1-private')
        const pub = key.exportKey('pkcs1-public')
        let hash_id = farmhash.fingerprint32(pri);
        myid = hash_id
        // console.log('to db', myid)
        db.player.insert({
            pri,
            pub,
            hash_id
        });
    }

    const message = Buffer.from('\x510000\x00');
    message.writeUInt32BE(myid, 1)
    udp.post(message);
    udp.on('message', (buff, rinfo) => {
        // console.log(buff)
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
                tid = Buffer.from(tid)
                if (myid == util.b2ui(tid)) {
                    // console.log('filter out myself from peers')
                    return;
                }
                const pid = util.b2s(tid)
                players[pid] = new Player(udp, myid, tid, players, true)
            })
            heart_beat()
            break;
        case 1:
            let json_data = util.b2s(data)
            // json_data = util.dec_str(json_data, util.ui2b(myid))
            json_data = JSON.parse(json_data)
            // console.log(json_data)
            switch (json_data.cmd) {
                case 1:
                    {
                        const tid = util.ui2b(json_data.source)
                        const pid = util.b2s(tid)
                        players[pid] = new Player(udp, myid, tid, players, false)
                        players[pid].on_target_signal(json_data.data)
                    }
                    break;
                case 2:
                    {
                        // console.log(json_data)
                        const tid = util.ui2b(json_data.source)
                        const pid = util.b2s(tid)
                        players[pid] && players[pid].on_target_signal(json_data.data)
                    }
                    break;
            }
            break;
        case 4:
            const count = data.readUInt32BE(0);
            heart_beat();
            console.log('online player:'+count);
            break;    
    }
    // udp.close();
}