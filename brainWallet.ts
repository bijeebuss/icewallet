declare var require;
declare var Buffer;
var bitcore = require('bitcore-lib');

function CreateBrainWallet(phrase){
  var value = new Buffer(phrase); 

  for (let i = 0; i < 100000; i++){
    value = bitcore.crypto.Hash.sha256(value);
  }

  var bn = bitcore.crypto.BN.fromBuffer(value);
  return new bitcore.PrivateKey(bn);
}

export {CreateBrainWallet};
//console.log(bn);
//console.log(pk.toString());
//console.log(pk.toWIF());
//console.log(pk.toAddress());
