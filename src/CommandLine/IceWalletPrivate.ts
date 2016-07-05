import readline = require('readline');
import fs = require('fs');
import PrivateWalletService from '../Services/PrivateWalletService'
import {WalletInfo} from '../Models/WalletInfo'
import TransactionInfo from '../Models/transactionInfo'
import inquirer = require('inquirer');

const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
});

export default class IceWalletPrivate {

  wallet:PrivateWalletService;

  constructor(
    public pathToWalletInfo, 
    public pathToUnsignedTransaction, 
    public pathToSignedTransaction,
    newWallet:boolean) {
      if(newWallet){
        this.createNewWallet((err,wallet) => {
          if(err){
            return console.log(err);
          }
          console.log('sucessfully created wallet');
          this.wallet = wallet;
          this.displayMenu();
        })
      }
      else{
        console.log('loading and decryting wallet from ' + this.pathToWalletInfo)
        this.loadWalletFromInfo('poop', pathToWalletInfo, (err,wallet) => {
          if(err){
            return console.log(err);
          }
          console.log('sucessfully loaded wallet');
          this.wallet = wallet;
          this.displayMenu();
        })
      }
    }

  loadWalletFromInfo(password:string, path:string, callback:(err,wallet:PrivateWalletService) => void){
    console.log('loading and decrypting wallet, this might take a minute');
    fs.readFile(path, 'hex', (err, data) => {
      if (err){
        return callback(err,null);
      }
      PrivateWalletService.openWallet(password, data, (err, info, wallet) => {
        if(err == 'SEED_MISSING'){
          return this.verifySeed(password, info, callback);
        }
        else if (err){
          return callback(err, null);
        }
        return callback(err, wallet);
      })
    })
  }

  verifySeed(password:string, info:WalletInfo, callback:(err, wallet:PrivateWalletService) => void){
    inquirer.prompt([{
      default: null,
    }])
    rl.question('the seed is not stored in the info please enter it now to open the wallet\n', (seed) => {
        PrivateWalletService.seedWallet(password, info, seed, callback);    
    });
  }

  createNewWallet(callback:(err,wallet:PrivateWalletService) => void){
    rl.question('Please create a password for the new wallet \n', (password1) => {
      rl.question('Please retype the password \n', (password2) => {
        if(password1 != password2){
          return callback('Passwords dont match', null);
        }
        rl.question('Please type the BIP39 Mnemonic seed for the new wallet, or leave blank for random \n', (seed) => {
          rl.question('Do you want to export the seed with the wallet info, (exports are always encrypted) y/n? \n', (exportSeed) => {
            rl.question('What is the starting external address index (default 0) \n', (externalIndex) => {
              rl.question('What is the starting change address index, (default 0) \n', (changeIndex) => {
                var info = new WalletInfo();
                info.seed = seed;
                info.exportSeed = exportSeed == 'y' ? true : false;
                info.nextUnusedAddresses.external = Number(externalIndex);
                info.nextUnusedAddresses.change = Number(changeIndex);
                return callback(null, new PrivateWalletService(info, password1));
              })
            })
          })
        })
      })
    })
  }

  displayMenu(){
    console.log('1. deposit');
    console.log('2. withdraw <FeeInBTC>');
    console.log('3. save and quit (dont quit any other way)');

    rl.question('choose an option\n', (answer) => {
      if(answer == '1'){
        this.deposit();
      }
      else if(answer == '2'){
        let fee = Number(answer.split(' ')[1]);
        this.withdraw(fee);
      }
      else if(answer == '3'){
        this.saveAndQuit();
      }
    });
  }

  saveInfo(encrypted:string, callback:(err) => void){
    fs.writeFile(this.pathToWalletInfo, new Buffer(encrypted,'hex'), (err) => {
      if (err){
        return callback(err);
      }
      return callback(null);
    })
  }

  deposit(){
    var newAddress = this.wallet.getDepositAddress();
    console.log('Send coins to:' + newAddress);

    rl.question('Did the transaction complete? y/n\n', (answer) => {
      if(answer == 'y'){
        console.log('good')
        this.wallet.incrementExternalIndex();
      }
      else if(answer == 'n'){
        console.log('try again');
      }
      else{
        console.log('answer either "y" or "n"');
      }
      this.displayMenu();
    });
  }

  verifyTransaction(transaction:TransactionInfo, fee, callback:(err) => void){
    console.log('Please verify this transaction');
    for(let address in transaction.outputsBTC){
      console.log('Send: '   + transaction.outputsBTC[address]);
      console.log('To:   '   + address);
    }

    console.log('Fee:  '   + fee);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

    rl.question('answer y/n\n', (answer) => {
      if(answer == 'y'){
        return callback(null);
      }
      else if(answer == 'n'){
        return callback('Fix issues and try again');
      }
      else{
        console.log('answer either "y" or "n"');
        return callback('invalid answer');
      }
    });
  }

  withdraw(fee:number){
    fs.readFile(this.pathToUnsignedTransaction,'utf8', (err, serialized) => {
      if(err){
        throw err;
      }
      var transactionInfo = this.wallet.parseTransaction(serialized);

      this.verifyTransaction(transactionInfo, fee, (err) => {
        if (err){
          throw err;
        }
        // add the fee, change script and sign it
        var signed = this.wallet.completeTransaction(serialized, fee);
        // export the signed transaction
        fs.writeFile(this.pathToUnsignedTransaction, signed, (err) => {
          if(err){
            throw err;
          }
          // update the change index count
          this.wallet.incrementChangeIndex();
          console.log('transaction successfully signed and written to ' + this.pathToSignedTransaction);
          this.displayMenu();
        })
      })
    })
  }

  saveAndQuit(){
    console.log('encerypting and saving wallet to ' + this.pathToWalletInfo)
    this.wallet.exportInfo((err, encrypted) => {
      if(err){
        console.log(err);
        return this.displayMenu();
      }
      this.saveInfo(encrypted, (err) => {
        if(err){
          console.log(err);
          return this.displayMenu();
        }
        rl.close();
        console.log('Sucessfully encrypted and saved info, goodbye');
      })
    });
  }
}