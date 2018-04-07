const Peer = require('simple-peer')
const wrtc = require('wrtc')
const isBuffer = require('is-buffer')
const util = require("./util");
class Player {
    constructor(udp, self_id, tid, players) {
        this.udp = udp
        this.self_id = self_id
        this.tid = tid
        this.players = players
        this.peer = new Peer({ initiator: true, wrtc: wrtc })
        this.peer.on('signal', this.on_self_signal.bind(this) )
    }
    on_self_signal(sig) {
        const payload = {
            
        }
        const pack = Buffer.concat( [util.cb(this.self_id, 1), Buffer.from(sig)] )
        this.udp.send(pack, 1979, 'localhost')
    } 
    on_target_signal(sig) {

    } 
}

module.exports = Player