
import {PublicWalletService} from '../src/Services/PublicWalletService';
import PrivateWalletService from '../src/Services/PrivateWalletService';
import {PrivateWalletInfo} from '../src/Models/PrivateWalletInfo'
var bitcore = require('bitcore-lib');

var seed = 'scheme caution cabin snack squeeze busy lava duck bleak cement medal endless';
var walletInfo = new PrivateWalletInfo(seed, true);
walletInfo.addAccount('Default', 0 , 20, 20)
var privateWallet = new PrivateWalletService(walletInfo,'secret');
var pubKey = privateWallet.hdPublicKey.toString();
console.log(pubKey);

var publicWallet = new PublicWalletService(pubKey, privateWallet.password);

publicWallet.update((err, wallet) => {
  if(err){
    console.log(err);
  }
  console.log('Confirmed Balance: ' + wallet.balance);

  wallet.createTransaction(
    '1BbRFw5nvkZDRK56qtCvcy1yFR3Q2nWPgf',
    1000, 
    (err,transaction) => {
      if(err){
        throw err;
      }
      var signedTransaction = privateWallet.completeTransaction(transaction, 15000);
       
      wallet.broadcastTransaction(signedTransaction, (err, txid) => {
        if (err){
          return console.log(err)
        }
        console.log('transaction broadcasted with txid: ' + txid);
        privateWallet.incrementExternalIndex();
      });
    })
})






