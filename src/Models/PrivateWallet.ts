var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
import readline = require('readline');
import {AddressIndexes} from './AddressIndexes'
import fs = require('fs');


class PrivateWallet {
  masterHdPrivKey : any;
  accountHdPrivKey: any;
  pathToAddressesIndexes:string = './data/addressIndexes.json';
  transactionImportPath:string = './data/initialTransaction.dat';
  transactionExportPath:string = './data/signedTransaction.dat';


  constructor(seed: string){
    var mnemonic = new Mnemonic(seed);
    this.masterHdPrivKey = mnemonic.toHDPrivateKey();
    this.accountHdPrivKey = this.masterHdPrivKey.derive("m/44'/0'/0'");
  }

  hdPrivateKey(index:number, change:boolean):any{
    var chain:number = change ? 1 : 0;
    return this.accountHdPrivKey.derive(chain).derive(index);
  }

  address(index:number, change:boolean):string{
    return this.hdPrivateKey(index,change).privateKey.toAddress().toString();
  }
  
  completeTransaction(transaction, fee, indexes:AddressIndexes){
    var privateKeys = sdfasfd
    
    transaction
      .change(this.address(indexes.change, true))
      .fee(fee)
      .sign(privateKeys);
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

  withdraw(fee:number, callback:(err,transaction)=>void){
    async.parallel<string>([
      (cb) => fs.readFile(this.transactionImportPath,'utf8', cb),
      (cb) => fs.readFile(this.pathToAddressesIndexes,'utf8', cb)
    ], (err, results) => {
      if(err){
        return callback(err, null);
      }
      var transaction = new bitcore.Transaction(results[0]);
      var indexes:AddressIndexes = JSON.parse(results[1]);
      //TODO prompt user to verify it
      this.completeTransaction(transaction, fee, indexes);
      fs.writeFile(this.transactionExportPath, transaction.serialize(), (err) => {
        if(err){
          return callback(err, transaction);
        }
        console.log('transaction successfull signed and written to ' + this.transactionExportPath);
        return callback(null, transaction);
      })
    })
  }
}

export {PrivateWallet};