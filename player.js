const fs = require('fs');
const Peer = require('simple-peer')
const wrtc = require('wrtc')
const isBuffer = require('is-buffer')
const util = require("./util");
const PStream = require("./pstream");
// const autoBindI = require('auto-bind-inheritance');
class Player {
    constructor(udp, self_id, tid, players, initiator) {
        // autoBindI(this);
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
        // this.peer.on('data', this.test.bind(this))
        this.peer.on('close', this.on_peer_close.bind(this))
        this.pstream = new PStream(this.peer);
    }
    test(data){
        console.log('on_test', data)
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
        
        this.udp.post(pack);
    }
    on_target_signal(sig) {
        // console.log('on_target_signal, sig=', sig)
        this.peer.signal(sig)
    }
    on_peer_connect() {
        console.log('on peer connected')
        // const data = fs.readFileSync('./design.txt')
        // const fn = "d:/aaa.mp4";
        // const stats = fs.statSync(fn)
        // let ss = fs.createReadStream(fn, { highWaterMark: 1024})
        // let ps = this.pstream.wStream('test', stats.size);
        // ps.on('progress', progress=>{
        //     console.log(`progress:${progress}`)
        // })
        // ss.pipe( ps );
        // var myFile = fs.createWriteStream("bbb.mp4");
        // this.pstream.rStream('test').pipe(myFile)
        // this.peer.send(data)
        // this.peer.send('david')
    }
    on_peer_close() {
        console.log('on peer on_peer_close')
    }
    on_peer_data(data) {
        // console.log('on_peer_data', data)
        
        // fs.writeFileSync('./aaa.txt', data)
    }
}

module.exports = Player