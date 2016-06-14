import {PrivateWallet} from "../src/Models/PrivateWallet";
import {PublicWallet} from "../src/Models/PublicWallet";
var bitcore = require('bitcore-lib');


var privateWallet = new PrivateWallet('scheme caution cabin snack squeeze busy lava duck bleak cement medal endless');

var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString()
console.log(pubKey);

var publicWallet = new PublicWallet(pubKey)

//privateWallet.deposit();

publicWallet.update((err, wallet) => {
  if(err){
    console.log(err);
  }
  return wallet.initiateTransaction(privateWallet.address(3,false), bitcore.Unit.fromBTC(0.0075).toSatoshis());
})