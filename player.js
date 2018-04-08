const fs = require('fs');
const Peer = require('simple-peer')
const wrtc = require('wrtc')
const isBuffer = require('is-buffer')
const util = require("./util");
class Player {
    constructor(udp, self_id, tid, players, initiator) {
        this.initiator = initiator
        this.udp = udp
        this.self_id = self_id
        this.tid = tid
        this.players = players
        this.peer = new Peer({ 
            initiator, 
            // trickle: true,
            wrtc: wrtc,
            // config: {
            //     iceServers: [
            //         { url: 'stun:139.224.228.83' },
            //         {
            //             url: 'turn:139.224.228.83',
            //             username: 'freego',
            //             credential: 'freego2017'
            //         },
            //         {
            //             url: 'turn:numb.viagenie.ca',
            //             username: 'david@cninone.com',
            //             credential: 'freego2017'
            //         }
            //     ]
            // }
        })
        this.peer.on('signal', this.on_self_signal.bind(this))
        this.peer.on('connect', this.on_peer_connect.bind(this))
        this.peer.on('data', this.on_peer_data.bind(this))
    }
    on_self_signal(sig) {
        const payload = {
            cmd: this.initiator?1:2,
            data: sig,
            source: this.self_id
        }
        let data = JSON.stringify(payload)
        // data = util.enc_str(data, this.tid)
        const pack = Buffer.concat([util.cb(this.self_id, 1), this.tid, util.s2b(data)])
        
        this.udp.send(pack, 1979, 'localhost')
    }
    on_target_signal(sig) {
        // console.log('on_target_signal, sig=', sig)
        this.peer.signal(sig)
    }
    on_peer_connect() {
        console.log('on peer connected')
        // const data = fs.readFileSync('./design.txt')
        // this.peer.send(data)
    }
    on_peer_data(data) {
        // console.log('on peer data', data)
        var myFile = fs.createWriteStream("myOutput.txt");
        this.peer.pipe(myFile)
        // fs.writeFileSync('./aaa.txt', data)
    }
}

module.exports = Player