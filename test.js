const _ = require('lodash');
const util = require("./util");

const key = Buffer.from('\x01\x02\x03\x04')
// let a = 'Hello world'
// a = util.enc_str(a, key)
// a = util.dec_str(a, key)
// console.log( util.b2ui(util.ui2b(234) ))
console.log( key.slice(4).length )