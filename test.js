const _ = require('lodash');


let a = Buffer.concat( _.map([ '\u0003\u0004\u0005\u0006', '\u0001\u0002\u0003\u0004' ], buf=>Buffer.from(buf)) )
console.log(a)