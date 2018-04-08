
const crypto = require('crypto'),
    algorithm = 'aes192',
    password = 'd6F3Efeq';

function b2s(buff) {
    return buff.toString('binary')
}
function s2b(s) {
    return Buffer.from(s, 'binary')
}

function ui2b(i) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(i)
    return buf
}
function ui2s(i) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(i)
    return b2s(buf)
}
function b2ui(buf) {
    return buf.readUInt32BE(0)
}

//command buffer
function cb(sid, cmd) {
    const buff = Buffer.from('\x510000\x00');
    buff.writeUInt32BE(sid, 1)
    buff.writeUInt8(cmd, 5)
    return buff
}
function enc_str(text, pass = password) {
    var cipher = crypto.createCipher(algorithm, pass)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function dec_str(text, pass = password) {
    var decipher = crypto.createDecipher(algorithm, pass)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}
function enc_buff(buffer, pass = password) {
    var cipher = crypto.createCipher(algorithm, pass)
    var crypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return crypted;
}

function dec_buff(buffer, pass = password) {
    var decipher = crypto.createDecipher(algorithm, pass)
    var dec = Buffer.concat([decipher.update(buffer), decipher.final()]);
    return dec;
}

module.exports = {
    b2s,
    s2b,
    cb,
    ui2b,
    b2ui,
    ui2s,
    enc_str,
    dec_str,
    enc_buff,
    dec_buff
}