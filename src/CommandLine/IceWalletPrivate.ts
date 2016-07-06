import readline = require('readline');
import fs = require('fs');
import PrivateWalletService from '../Services/PrivateWalletService'
import {WalletInfo} from '../Models/WalletInfo'
import TransactionInfo from '../Models/transactionInfo'
import inquirer = require('inquirer');

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
      name:'seed',
      message:'the seed is not stored in the info please enter it now to open the wallet\n',
    }], (answers) => {
      PrivateWalletService.seedWallet(password, info, answers['seed'].toString(), callback); 
    })
  }

  createNewWallet(callback:(err,wallet:PrivateWalletService) => void){
    inquirer.prompt([
      {
        name:'password1',
        type:'password',
        validate:(password) => {if(!password) return 'Password required'; else return true}
      },
      {
        name:'password2',
        type:'password',
        validate:(password) => {if(!password) return 'Password required'; else return true}
      }], (passwords) => {
        if(passwords['password1'] != passwords['password2']){
          return callback('Passwords dont match', null);
        }
        let password = passwords['password1'];
        inquirer.prompt([
          {
            name:'seed',
            message:'Please type the BIP39 Mnemonic seed for the new wallet, or leave blank for random',
            default:null,
          },
          {
            name:'exportSeed',
            message:'Do you want to export the seed with the wallet info, (exports are always encrypted) y/n?',
            type:'confirm',
          },
          {
            name:'externalIndex',
            message:'What is the starting external address index (default 0)',
            default:0,
            validate:(externalIndex) => {if(!Number.isInteger(Number(externalIndex))) return 'Must be an integer'; else return true}
          },
          {
            name:'changeIndex',
            message:'What is the starting change address index, (default 0)',
            default:0,
            validate:(changeIndex) => {if(!Number.isInteger(Number(changeIndex))) return 'Must be an integer'; else return true}
          },
        ],(answers) => {
          var info = new WalletInfo();
          info.seed = answers['seed'].toString();
          info.exportSeed = Boolean(answers['exportSeed']);
          info.nextUnusedAddresses.external = Number(answers['externalIndex']);
          info.nextUnusedAddresses.change = Number(answers['changeIndex']);
          return callback(null, new PrivateWalletService(info, password.toString()));
        })
      })
  }

  displayMenu(){
    var choices = ['Deposit', 'Withdraw', 'Save and Quit (dont quit any other way)' ]
    inquirer.prompt([
      {
        name:'choice',
        type:'list',
        choices:choices,
      },
      {
        name:'fee',
        message:'enter your desired fee in satoshis',
        when: (answers) => answers['Choice'] == choices[1],
        validate:(fee) => {if(!Number.isInteger(Number(fee))) return 'Must be an integer'; else return true}
      }], 
      (answers) => {
        let choice = answers['choice'];
        let fee = Number(answers['fee']);

        if(choice == choices[0]){
        this.deposit();
        }
        else if(choice == choice[1]){
          this.withdraw(fee);
        }
        else if(choice == choices[2]){
          this.saveAndQuit();
        }
      })
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
    inquirer.prompt(
      {
        name:'choice',
        message:'Did the transaction complete? y/n',
        type:'confirm'
      }, 
      (answers) => {
        if(answers['choice']){
          console.log('good')
          this.wallet.incrementExternalIndex();
        }
        else if(answers['choice']){
          console.log('try again');
        }
        this.displayMenu();
    })
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
        console.log('Sucessfully encrypted and saved info, goodbye');
      })
    });
  }
}