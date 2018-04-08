const _ = require('lodash');
const util = require("./util");

// const key = Buffer.from('\x01\x02\x03\x04')
// let a = 'Hello world'
// a = util.enc_str(a, key)
// a = util.dec_str(a, key)
// console.log( util.b2ui(util.ui2b(234) ))
// console.log( key.slice(4).length )
var Peer = require('simple-peer')
const wrtc = require('wrtc')
var peer1 = new Peer({ initiator: true, wrtc: wrtc  })
var peer2 = new Peer({ wrtc: wrtc })

peer1.on('signal', function (data) {
  // when peer1 has signaling data, give it to peer2 somehow
  console.log('peer2.signal(data)', typeof data)
  peer2.signal(data)
})

peer2.on('signal', function (data) {
  // when peer2 has signaling data, give it to peer1 somehow
//   console.log(' peer2.on signal')
  peer1.signal(data)
})

peer1.on('connect', function () {
  // wait for 'connect' event before using the data channel
  peer1.send('hey peer2, how is it going?')
})

peer2.on('data', function (data) {
  // got a data channel message
  console.log('got a message from peer1: ' + data)
})