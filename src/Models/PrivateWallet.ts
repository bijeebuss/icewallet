var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
import readline = require('readline');
import {AddressIndexes} from './AddressIndexes'
import fs = require('fs');


class PrivateWallet {
  masterHdPrivKey : any;
  accountHdPrivKey: any;
  pathToAddressesIndexes:string = './data/addressIndexes.json';

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

  signTransaction(transaction){
    transaction.sign(this.hdPrivateKey(0,false).privateKey)
  }

  addChangeAddress(transaction){
    transaction.change(this.address(0,true))
  }

  addFee(transaction, fee:number){
    transaction.fee(fee);
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

  withdraw(transaction, fee:number){
    this.addChangeAddress(transaction);
    this.addFee(transaction, fee);
    this.signTransaction(transaction);
  }

}

export {PrivateWallet};