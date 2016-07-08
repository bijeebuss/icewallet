import fs = require('fs');
import PrivateWalletService from '../Services/PrivateWalletService'
import {WalletInfo} from '../Models/WalletInfo'
import TransactionInfo from '../Models/transactionInfo'
import inquirer = require('inquirer');

export default class IceWalletPrivate {

  wallet:PrivateWalletService;

  constructor(
    public pathToWalletInfo:string, 
    public pathToUnsignedTransaction:string, 
    public pathToSignedTransaction:string,
    newWallet:boolean,
    callback?:(err,wallet:IceWalletPrivate) => void) {
      
      let done = (err,wallet:PrivateWalletService) => {
        if(err && callback){
            return callback(err,null);
          }
        else if (err){
          return console.log(err);
        }
        console.log('sucessfully loaded wallet');
        this.wallet = wallet;
        if(callback){
          return callback(null, this);
        }
        else{
          this.displayMenu();
        }
      }
      
      if(newWallet){
        this.createNewWallet(done)
      }
      else{
        console.log('loading and decryting wallet from ' + this.pathToWalletInfo)
        this.loadWalletFromInfo(done);
      }
    }

  loadWalletFromInfo(callback:(err,wallet:PrivateWalletService) => void) {
    inquirer.prompt({
      name:'password',
      type:'password',
      message:'enter your password to open the wallet',
    })
    .then((answers) => {
      let password = answers['password'].toString();
      console.log('loading and decrypting wallet info from' + this.pathToWalletInfo);
      console.log('this might take a minute');
      fs.readFile(this.pathToWalletInfo, 'hex', (err, data) => {
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
    })
  }

  verifySeed(password:string, info:WalletInfo, callback:(err, wallet:PrivateWalletService) => void){
    inquirer.prompt([{
      name:'seed',
      message:'the seed is not stored in the info please enter it now to open the wallet',
    }])
    .then((answers) => {
      console.log('verifying seed...')
      PrivateWalletService.seedWallet(password, info, answers['seed'].toString(), callback); 
    })
  }

  createNewWallet(callback:(err,wallet:PrivateWalletService) => void){
    inquirer.prompt([
      {
        name:'password1',
        type:'password',
        message:'create a password',
        validate:(password) => {if(!password) return 'Password required'; else return true}
      },
      {
        name:'password2',
        type:'password',
        message:'retype password',
        validate:(password) => {if(!password) return 'Password required'; else return true}
      }])
      .then((passwords) => {
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
            message:'Do you want to export the seed with the wallet info, (exports are always encrypted)?',
            type:'confirm',
          },
          {
            name:'externalIndex',
            message:'What is the starting external address index',
            default:0,
            validate:(externalIndex) => {if(!Number.isInteger(Number(externalIndex))) return 'Must be an integer'; else return true}
          },
          {
            name:'changeIndex',
            message:'What is the starting change address index',
            default:0,
            validate:(changeIndex) => {if(!Number.isInteger(Number(changeIndex))) return 'Must be an integer'; else return true}
          },
        ])
        .then((answers) => {
          var info = new WalletInfo();
          info.seed = answers['seed'].toString();
          info.exportSeed = Boolean(answers['exportSeed']);
          info.nextUnusedAddresses.external = Number(answers['externalIndex']);
          info.nextUnusedAddresses.change = Number(answers['changeIndex']);
          console.log('sucessfully created wallet');
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
        message:'Choose an option',
        choices:choices,
      },
      {
        name:'fee',
        message:'enter your desired fee in satoshis',
        when: (answers) => {
          return answers['choice'] == choices[1]
        },
        validate:(fee) => {if(!Number.isInteger(Number(fee))) return 'Must be an integer'; else return true}
      }])
      .then((answers) => {
        let choice = answers['choice'];
        let fee = Number(answers['fee']);
        let done = (err) => {
          if (err){
            console.log(err);
          }
          this.displayMenu();
        }
        
        if(choice == choices[0]){
        this.deposit(done);
        }
        else if(choice == choices[1]){
          this.withdraw(fee, done);
        }
        else if(choice == choices[2]){
          this.saveAndQuit(done);
        }
        else{
          this.displayMenu();
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

  deposit(callback:(err) => void){
    var newAddress = this.wallet.getDepositAddress();
    console.log('Send coins to:' + newAddress);
    inquirer.prompt(
      {
        name:'choice',
        message:'Did the transaction complete?',
        type:'confirm'
      })
      .then((answers) => {
        if(answers['choice']){
          console.log('good')
          this.wallet.incrementExternalIndex();
        }
        else if(answers['choice']){
          console.log('try again');
        }
        return callback(null);
    })
  }

  verifyTransaction(transaction:TransactionInfo, fee, callback:(err) => void){
    console.log('Please verify this transaction');
    for(let address in transaction.outputsBTC){
      console.log('Send: '   + transaction.outputsBTC[address]);
      console.log('To:   '   + address);
    }

    console.log('Fee:  '   + fee);

    inquirer.prompt({
      name:'complete',
      type:'confirm',
      message:'answer y/n',
    })
    .then((answers) => {
      let complete:boolean = answers['complete'];
      if(complete){
        return callback(null);
      }
      else {
        return callback('Fix issues and try again');
      }
    });
  }

  withdraw(fee:number, callback:(err) => void){
    fs.readFile(this.pathToUnsignedTransaction,'utf8', (err, serialized) => {
      if(err){
        return callback(err);
      }
      var transactionInfo = this.wallet.parseTransaction(serialized);

      this.verifyTransaction(transactionInfo, fee, (err) => {
        if (err){
          return callback(err);
        }
        // add the fee, change script and sign it
        var signed = this.wallet.completeTransaction(serialized, fee);
        // export the signed transaction
        fs.writeFile(this.pathToSignedTransaction, signed, (err) => {
          if(err){
            return callback(err);
          }
          // update the change index count
          this.wallet.incrementChangeIndex();
          console.log('transaction successfully signed and written to ' + this.pathToSignedTransaction);
          return callback(null);  
        })
      })
    })
  }

  saveAndQuit(callback:(err) => void){
    console.log('encerypting and saving wallet to ' + this.pathToWalletInfo)
    this.wallet.exportInfo((err, encrypted) => {
      if(err){
        return callback(err);
      }
      this.saveInfo(encrypted, (err) => {
        if(err){
          return callback(err);
        }
        console.log('Sucessfully encrypted and saved info, goodbye');
        return callback(null); 
      })
    });
  }
}