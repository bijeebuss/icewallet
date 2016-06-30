import {PrivateWallet} from "../src/Models/PrivateWallet";
import {PublicWallet} from "../src/Models/PublicWallet";
var bitcore = require('bitcore-lib');


var seed = 'scheme caution cabin snack squeeze busy lava duck bleak cement medal endless';


var privateWallet = PrivateWallet.createNew('poop', './data/walletInfo.dat',false, seed, 7, 5);
privateWallet.exportInfo((err) => {
  if(err){
    throw err;
  }
  var privateWallet = PrivateWallet.loadFromInfo('poop','./data/walletInfo.dat', (err,privateWallet) => {
    if(err){
      throw err;
    }
  });
})







// var privateWallet = PrivateWallet.loadFromInfo('poop','./data/walletInfo.dat', (err,privateWallet) => {
//   if(err){
//     throw err;
//   }

//   var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString()
//   console.log(pubKey);

//   var publicWallet = new PublicWallet(pubKey)

//   privateWallet.deposit();

  // publicWallet.update((err, wallet) => {
  //   if(err){
  //     console.log(err);
  //   }
  //   console.log('Confirmed Balance: ' + wallet.balance);
  //   wallet.initiateTransaction(privateWallet.address(5,false), bitcore.Unit.fromBTC(0.0095).toSatoshis(), (err,transaction) => {
  //     if(err){
  //       throw err;
  //     }
  //     privateWallet.completeTransaction(12000, (err,transaction) => {
  //       if (err){
  //         return console.log(err);
  //       }
  //       wallet.broadcastTransaction((err, txid) => {
  //         if (err){
  //           return console.log(err)
  //         }
  //         console.log('transaction broadcasted with txid: ' + txid);
  //       })
  //     })
  //   });
  // })
})

