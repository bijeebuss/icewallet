
import {PublicWalletService} from '../src/Services/PublicWalletService';
import PrivateWalletService from '../src/Services/PrivateWalletService';
import IceWalletPrivate from '../src/CommandLine/IceWalletPrivate';
var bitcore = require('bitcore-lib');
 
var seed = 'scheme caution cabin snack squeeze busy lava duck bleak cement medal endless';

new IceWalletPrivate(
  '/Users/Michael/iceWallets/old.dat', 
  process.env.HOME + '/unsignedTransaction.dat', 
  process.env.HOME + '/signedTransaction.dat',
  false,
  (err,iceWallet) => {
    if(err){
      throw err;
    }
    var privateWallet = iceWallet.wallet;
    var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString()
    console.log(pubKey);

    var publicWallet = new PublicWalletService(pubKey, privateWallet.password);

    publicWallet.update((err, wallet) => {
      if(err){
        console.log(err);
      }
      console.log('Confirmed Balance: ' + wallet.balance);

      wallet.initiateTransaction(
        '1NeQmcmKN3NqXGbe88rk15gwDHiBK6YMce',
        1970000, 
        (err,transaction) => {
          if(err){
            throw err;
          }
          iceWallet.withdraw(12000, (err) => {
            if (err){
              return console.log(err);
            }
            wallet.broadcastTransaction((err, txid) => {
              if (err){
                return console.log(err)
              }
              console.log('transaction broadcasted with txid: ' + txid);

              iceWallet.deposit((err) => {
                if(err){
                  console.log(err);
                }
              });
            })
          })
        }
      );
    })
  }
)





