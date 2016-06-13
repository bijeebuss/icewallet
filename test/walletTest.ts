import {PrivateWallet} from "../src/Models/PrivateWallet";
import {PublicWallet} from "../src/Models/PublicWallet";
var bitcore = require('bitcore-lib');


var privateWallet = new PrivateWallet('scheme caution cabin snack squeeze busy lava duck bleak cement medal endless');

var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString()
console.log(pubKey);

var publicWallet = new PublicWallet(pubKey)

privateWallet.deposit();

publicWallet.update((err, wallet) => {
  if(err){
    console.log(err);
  }
  wallet.createTransaction(wallet.getAddress(1,false).toString(), bitcore.Unit.fromBTC(0.0025).toSatoshis(), (err, transaction) =>{
    if(err){
      return console.log(err);
    }
    
    console.log(wallet.balance);
    
    //privateWallet.addChangeAddress(transaction);
    //privateWallet.addFee(transaction, 5000);
    //privateWallet.signTransaction(transaction);
    
    // wallet.boradcastTransaction(transaction, (err,txid) => {
    //   if (err){
    //     return console.log(err)
    //   }
    //   console.log(txid);
    // })
  })
})