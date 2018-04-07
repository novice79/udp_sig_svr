const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const _ = require('lodash');
let peers = {}
function handle_msg(pid, cmd){
    // console.log(pid, cmd)
    if(cmd == 0){
        let sps = _.sampleSize( _.keys(peers), 500 )
        sps = _.map( sps, buf=>Buffer.from(buf, 'binary') )
        sps.unshift( Buffer.from('\x00') )
        // console.log(sps)
        peers[pid].send( Buffer.concat( sps ) )
    }
}
server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    //   server.close();
});

server.on('message', (buff, rinfo) => {
    // console.log(rinfo)
    const is_valid = (buff[0] == 0x51 || buff[0] == 0x79) && buff.length >= 6 && buff.length < 1024
    if( !is_valid ) return

    let pid = buff.slice(1, 5);
    // console.log('pid=',pid)
    const cmd = buff[5]
    pid = pid.toString('binary')
    if(peers[pid]){
        clearTimeout( peers[pid].tm)
    }
    peers[pid] = {
        tm: setTimeout(()=>{
            delete peers[pid]
            // console.log('clear inactive peer')
        }, 5*60*1000),
        send:buff=>{
            server.send(buff, rinfo.port, rinfo.address)
        }
    }
    handle_msg(pid, cmd)
    // console.log(`server got: ${buff} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(1979);