declare var require;
var bitcore = require('bitcore-lib')
var Mnemonic = require('bitcore-mnemonic');
var HDPrivateKey = bitcore.HDPrivateKey;
   
var mnemonic = new Mnemonic('scheme caution cabin snack squeeze busy lava duck bleak cement medal endless');
var hdPrivateKey = mnemonic.toHDPrivateKey();
var addressKey = hdPrivateKey.derive("m/44'/0'/0'/0/0");
var address = addressKey.privateKey.toAddress();
var accountKey = hdPrivateKey.derive("m/44'/0'/0'")
var requestKey = hdPrivateKey.derive("m/1'/0");
var entropySource = bitcore.crypto.Hash.sha256(requestKey.privateKey.toBuffer()).toString('hex');

console.log("Address privateKey: " + addressKey.privateKey.toWIF());
console.log("Address: " + address.toString());
console.log("Master HDPrivateKey: " + hdPrivateKey.toString());
console.log("Master HDPublicKey: " + hdPrivateKey.hdPublicKey.toString());
console.log("Account HDPublicKey: " + accountKey.hdPublicKey.toString());
console.log("entropySource: " + entropySource);

//var entropySource:any = bitcore.crypto.Hash.sha256(accountKey.privateKey.toBuffer()).toString('hex');
export {hdPrivateKey,accountKey, entropySource};

//var retrieved = new HDPrivateKey('xpriv...');
//var derived = hdPrivateKey.derive("m/0'");

//var derivedByNumber = hdPrivateKey.derive(1).derive(2, true);
//var derivedByArgument = hdPrivateKey.derive("m/1/2'");
//if (derivedByNumber.xprivkey !== derivedByArgument.xprivkey) throw 'keysnotequal'

//var address = derived.privateKey.toAddress();
//var hdPublicKey = hdPrivateKey.hdPublicKey;
//console.log(hdPrivateKey.toString());
