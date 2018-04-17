const { Readable, Writable, Duplex } = require('stream');
// const autoBindI = require('auto-bind-inheritance');

class PWritable extends Writable {
    constructor(name, peer, options, file_size) {
        super(options);
        this.name = name;
        this.peer = peer;
        this.file_size = file_size;
        this.progress = 0;
        // autoBindI(this);
    }
    _write(chunk, encoding, callback) {
        
        const data = {
            cmd: this.name,
            buff: chunk.toString('binary')
        };
        // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', typeof chunk, encoding)
        this.peer.send( JSON.stringify(data) );
        this.progress += chunk.length;
        if(this.file_size){
            this.emit('progress', parseFloat(this.progress/this.file_size).toFixed(2) )
        } else {
            this.emit('progress', parseFloat(this.progress).toFixed(2) )
        }
        callback();
    }
    _final(callback){
        // console.log('in PWritable final')
        const data = { cmd: this.name };
        this.peer.send( JSON.stringify(data) );
        // this.destroy();
    }
}
class PReadable extends Readable {
    constructor(name, peer, options) {
        super(options);
        this.name = name;
        this.peer = peer;
        this.peer.on('data', this.on_peer_data.bind(this))
    }
    _read(size) {

    }
    on_peer_data(data){
        try{
            data = JSON.parse(data);
            if(data.cmd == this.name){
                if(data.buff){
                    this.push( Buffer.from(data.buff, 'binary') );
                } else {
                    console.log('readable push null')
                    this.push(null);
                    // this.destroy();
                }
            }
        } catch(err){

        }        
    }
}
class PStream {
    constructor(peer) {
        this.w_streams = {};
        this.r_streams = {};
        this.peer = peer;
    }
    wStream(name, file_size) {
        const streams = this.w_streams;
        if (!streams[name]) streams[name] = new PWritable(name, this.peer, {
            destroy(err, callback) {
                console.log('destroy write stream')
                delete streams[name];
            }
        }, file_size);
        return streams[name];
    }
    rStream(name) {
        const streams = this.r_streams;
        if (!streams[name]) streams[name] = new PReadable(name, this.peer, {
            destroy(err, callback) {
                console.log('destroy read stream')
                delete streams[name];
            }
        });
        return streams[name];
    }
}

module.exports = PStream