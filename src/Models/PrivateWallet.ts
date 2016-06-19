var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
import readline = require('readline');
import {AddressIndexes} from './AddressIndexes'
import WalletBase from './WalletBase'
import fs = require('fs');
import async = require('async');


class PrivateWallet extends WalletBase {
  walletHdPrivKey : any;
  accountHdPrivKey: any;
  pathToAddressesIndexes:string = './data/addressIndexes.json';
  transactionImportPath:string = './data/initialTransaction.dat';
  transactionExportPath:string = './data/signedTransaction.dat';


  constructor(seed: string){
    super((new Mnemonic(seed)).toHDPrivateKey().derive("m/44'/0'/0'").hdPublicKey.toString()); // typescript makes me do this :(
    this.walletHdPrivKey = (new Mnemonic(seed)).toHDPrivateKey();
    this.accountHdPrivKey = this.walletHdPrivKey.derive("m/44'/0'/0'");
  }

  hdPrivateKey(index:number, change:boolean):any{
    var chain:number = change ? 1 : 0;
    return this.accountHdPrivKey.derive(chain).derive(index);
  }
  
  privateKeyRange(start:number, end:number, change:boolean):string[]{
    var keys:string[] = [];
    for (var i:number = start; i <= end; i++){
      keys.push(this.hdPrivateKey(i,change).privateKey.toString());
    }
    return keys;
  }

  processTransaction(transaction, fee, indexes:AddressIndexes){
    var changePrivateKeys   = this.privateKeyRange(0, indexes.change   - 1, true); 
    var externalPrivateKeys = this.privateKeyRange(0, indexes.external - 1, false); 
    
    transaction
      .change(this.address(indexes.change, true))
      .fee(fee)
      .sign(externalPrivateKeys.concat(changePrivateKeys));
    
    // this performs some checks
    transaction.serialize();
  }

  deposit(){
    fs.readFile(this.pathToAddressesIndexes, 'utf8', (err, data) => {
      if (err){
        throw err;
      }
      var addressesIndexes:AddressIndexes = JSON.parse(data);

      var newAddress = this.address(addressesIndexes.external, false);
      console.log('Send coins to:' + newAddress);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Did the transaction complete? y/n\n', (answer) => {
        if(answer == 'y'){
          console.log('good')
          addressesIndexes.external += 1;
          fs.writeFile(this.pathToAddressesIndexes, JSON.stringify(addressesIndexes));
        }
        else if(answer == 'n'){
          console.log('try again');
        }
        else{
          console.log('answer either "y" or "n"');
        }
        rl.close();
      });

    });
  }

  verifyTransaction(transaction, callback:(err) => void){
    console.log('Please verify this transaction');
    console.log('Send: '   + bitcore.Unit.fromSatoshis(1000).toBTC());
    console.log('To:   '   + transaction);
    console.log('Fee:  '   + bitcore.Unit.fromSatoshis(transaction.getFee()).toBTC());
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

    rl.question('answer y/n\n', (answer) => {
        rl.close();
        if(answer == 'y'){
          return callback(null);
        }
        else if(answer == 'n'){
          return callback('user declined transaction');
        }
        else{
          console.log('answer either "y" or "n"');
          return callback('invalid answer');
        }
      });
  }

  completeTransaction(fee:number, callback:(err,transaction)=>void){
    async.parallel<string>([
      (cb) => fs.readFile(this.transactionImportPath,'utf8', cb),
      (cb) => fs.readFile(this.pathToAddressesIndexes,'utf8', cb)
    ], (err, results) => {
      if(err){
        return callback(err, null);
      }
      var transaction = new bitcore.Transaction(JSON.parse(results[0]));
      var indexes:AddressIndexes = JSON.parse(results[1]);
      
      this.processTransaction(transaction, fee, indexes);
      if (!transaction.isFullySigned()){
        return callback('transaction is not fully signed, check yourself before you wreck yourself', transaction);
      }
      
      this.verifyTransaction(transaction, (err) => {
        if (err){
          return callback(err, transaction);
        }
        // export the signed transaction
        fs.writeFile(this.transactionExportPath, JSON.stringify(transaction.toObject()), (err) => {
          if(err){
            return callback(err, transaction);
          }
          // update the change index count
          indexes.change += 1;
          fs.writeFile(this.pathToAddressesIndexes, JSON.stringify(indexes));
          console.log('transaction successfully signed and written to ' + this.transactionExportPath);
          return callback(null, transaction);
        })
      })
    })
  }
}

export {PrivateWallet};