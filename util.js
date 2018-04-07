
function b2s(buff){
    return buff.toString('binary')
}
function s2b(s){
    return Buffer.from(s, 'binary')
}
//command buffer
function cb(sid, cmd){
    const buff = Buffer.from('\x510000\x00');
    buff.writeUInt32BE(sid, 1)
    buff.writeUInt8(cmd, 5)
    return buff
}
module.exports = {
    b2s,
    s2b,
    cb
}