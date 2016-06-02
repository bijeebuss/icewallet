//declare var require;
//var Client = require("bitcore-wallet-client");
//var fs = require('fs');
import fs = require('fs');

import {hdPrivateKey,entropySource,accountKey} from './HDPrivateKey';

var BWS_INSTANCE_URL = 'https://bws.bitpay.com/bws/api'

var client = new Client({
  baseUrl: BWS_INSTANCE_URL,
  verbose: false,
});

// var opts = {
//   passphrase:"testpass"
// }
// client.seedFromRandomWithMnemonic(opts);
//console.log(client.getMnemonic());

debugger;
var opts = {}
//client.seedFromExtendedPrivateKey(hdPrivateKey.toString(), opts)
client.seedFromExtendedPublicKey(accountKey.hdPublicKey.toString(), 'other', entropySource, opts)


client.createWallet('MichaelsWallet', 'Michael', 1, 1, {}, function(err){
  if (err){
    console.log(err);
    return;
  }
  console.log('wallet created');
  fs.writeFileSync('Michael.dat', client.export());
});



// client.openWallet(function (error,ret){
//
//   // client.createAddress({}, function(err,addr){
//   //   if (err) {
//   //     console.log('error: ', err);
//   //     return;
//   //   };
//   //   console.log('\nReturn:', addr)
//   // });
//
//   client.getBalance({},function(err, balance){
//     console.log(balance);
//   });
// })
