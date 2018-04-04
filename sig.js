const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const _ = require('lodash');
let peers = {}
function handle_msg(pid, cmd){
    // console.log(pid, cmd)
    if(cmd == 0){
        const selected = _.sampleSize( _.keys(peers), 500 )
        console.log(selected)
        peers[pid].send(selected)
    }
}
server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    //   server.close();
});

server.on('message', (msg, rinfo) => {
    // console.log(rinfo)
    const is_valid = (msg[0] == 0x51 || msg[0] == 0x79) && msg.length >= 10 && msg.length < 1024
    if( !is_valid ) return

    const pid = msg.slice(1, 9);
    const cmd = msg[9]
    if(peers[pid]){
        clearTimeout( peers[pid].tm)
    }
    peers[pid] = {
        tm: setTimeout(()=>{
            delete peers[pid]
            // console.log('clear inactive peer')
        }, 5*60*1000),
        send:msg=>{
            server.send(msg, rinfo.port, rinfo.address)
        }
    }
    handle_msg(pid, cmd)
    // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(1979);