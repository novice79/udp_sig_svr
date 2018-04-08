const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const _ = require('lodash');
const util = require("./util");
let peers = {};
function handle_msg(pid, cmd, data) {
    // console.log(pid, cmd)
    switch (cmd) {
        case 0:
            let sps = _.sampleSize(_.keys(peers), 500)
            sps = _.map(sps, buf => Buffer.from(buf, 'binary'))
            sps.unshift(Buffer.from('\x00'))
            // console.log(sps)
            peers[pid].send(Buffer.concat(sps))
            break;
        case 1:
            const tid = util.b2s( data.slice(0, 4) )
            const target_peer = peers[tid]
            if( target_peer ){
                const buf = data.slice(3)
                buf[0] = 1;
                target_peer.send(buf)
            }
            break;    
    }
}

process.on('uncaughtException', err=> {
    // console.log('Caught exception: ', err);
    console.error('Caught exception: ', err);
});

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    //   server.close();
});

server.on('message', (buff, rinfo) => {
    // console.log(rinfo)
    const is_valid = (buff[0] == 0x51 || buff[0] == 0x79) && buff.length >= 6 && buff.length < 2048
    if (!is_valid) return
    if(buff.length > 1024){
        console.log(buff.length)
    }
    let pid = buff.slice(1, 5);
    // console.log('pid=',pid)
    const cmd = buff[5]
    const data = buff.slice(6);    
    pid = pid.toString('binary')
    if (peers[pid]) {
        clearTimeout(peers[pid].tm)
    }
    peers[pid] = {
        tm: setTimeout(() => {
            delete peers[pid]
            // console.log('clear inactive peer')
        }, 1 * 60 * 1000),
        send: buff => {
            server.send(buff, rinfo.port, rinfo.address)
        }
    }
    handle_msg(pid, cmd, data)
    // console.log(`server got: ${buff} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(1979);