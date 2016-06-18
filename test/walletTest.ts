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
  console.log('Confirmed Balance: ' + wallet.balance);
  wallet.initiateTransaction(privateWallet.address(4,false), bitcore.Unit.fromBTC(0.0125).toSatoshis(), (err,transaction) => {
    if(err){
      throw err;
    }
    privateWallet.completeTransaction(15000, (err,transaction) => {
      if (err){
        return console.log(err);
      }
      wallet.broadcastTransaction((err, txid) => {
        if (err){
          return console.log(err)
        }
        console.log('transaction broadcasted with txid: ' + txid);
      })
    })
  });
})