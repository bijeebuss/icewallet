import fs = require('fs');
let qrcode = require('qrcode-terminal');
import PrivateWalletService from '../Services/PrivateWalletService';
import IceWallet from './IceWallet';
import {WalletInfo} from '../Models/WalletInfo';
import TransactionInfo from '../Models/transactionInfo';
import inquirer = require('inquirer');

export default class IceWalletPrivate extends IceWallet {
  wallet:PrivateWalletService;

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
          try {
            var wallet = new PrivateWalletService(info, password.toString());
          }
          catch (err){
            return callback(err,null);
          }
          console.log('sucessfully created wallet');
          return callback(null, wallet);
        })
      })
  }

  displayMenu(){
    var choices = {
      deposit:'Deposit', 
      withdraw:'Withdraw', 
      showUsed:'Show Used Addresses', 
      generateNewAddresses:'Generate New Addresses',
      showSeed:'Show seed',
      showXpub:'Show Account Public Key',
      changeUsedAddresses:'Update Used Address Indexes',
      saveAndQuit:'Save and Quit (dont quit any other way)' ,
    }
    let choicesList = [];
    inquirer.prompt([
      {
        name:'choice',
        type:'list',
        message:'Choose an option',
        choices: Object.keys(choices).map<string>((choice) => choices[choice])
      },
      {
        name:'fee',
        message:'enter your desired fee in satoshis',
        when: (answers) => {
          return answers['choice'] == choices.withdraw
        },
        validate:(fee) => {if(!Number.isInteger(Number(fee))) return 'Must be an integer'; else return true}
      }])
      .then((answers) => {
        let choice:string = answers['choice'];
        let fee = Number(answers['fee']);
        let done = (err) => {
          if (err){
            console.log(err);
          }
          this.displayMenu();
        }
        switch(choice){
          case choices.deposit: 
            this.deposit(done);
            break;
          case choices.withdraw:
            this.withdraw(fee, done);
            break;
          case choices.showUsed:
            this.printAddresses();  
            done(null);
            break;
          case choices.generateNewAddresses:
            this.generateNewAddresses(done);
            break;  
          case choices.changeUsedAddresses:
            this.changeUsedAddresses(done);
            break;
          case choices.showSeed:  
            console.log(this.wallet.walletInfo.seed);
            done(null);
            break;
          case choices.showXpub:
            console.log(this.wallet.hdPublicKey.toString());
            this.displayMenu();
            break;
          case choices.saveAndQuit:
            this.saveAndQuit((err) => {});
            break;
          default:
            this.displayMenu();
        }
      })
  }

  deposit(callback:(err) => void){
    var newAddress = this.wallet.getDepositAddress();
    console.log('Send coins to:' + newAddress);
    qrcode.generate(newAddress);
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

  printAddresses(){
    console.log('change: ');
    this.wallet.addressRange(0, this.wallet.walletInfo.nextUnusedAddresses.change - 1, true).forEach((address) => {
      console.log('\t' + address);
    })
    console.log('external: ');
    this.wallet.addressRange(0, this.wallet.walletInfo.nextUnusedAddresses.external - 1, false).forEach((address) => {
      console.log('\t' + address);
    })
  }

  generateNewAddresses(callback:(err) => void){
    inquirer.prompt([
      {
        name:'count',
        message:'How many addresses?',
        validate:(fee) => {if(!Number.isInteger(Number(fee))) return 'Must be an integer'; else return true}
      },
      {
        name:'burn',
        message:'Mark these as used? (may cause issues updating public wallet if you dont use them then deposit to this account again)',
        type:'confirm',
      }])
      .then((answers) => {
        let count = Number(answers['count']);
        let burn = Boolean(answers['burn']);
        let starting = this.wallet.walletInfo.nextUnusedAddresses.external;
        let ending = starting + count - 1;
        this.wallet.addressRange(starting, ending, false).forEach((address) => {
          console.log(address);
        })
        if(burn){
          this.wallet.walletInfo.nextUnusedAddresses.external += count;
        }
        callback(null);
      })
  }
  changeUsedAddresses(callback:(err) => void){
    inquirer.prompt([
      {
        name:'externalIndex',
        message:'How many external addresses have been used',
        default:0,
        validate:(externalIndex) => {if(!Number.isInteger(Number(externalIndex))) return 'Must be an integer'; else return true}
      },
      {
        name:'changeIndex',
        message:'How many change addresses have been used',
        default:0,
        validate:(changeIndex) => {if(!Number.isInteger(Number(changeIndex))) return 'Must be an integer'; else return true}
      },
      ])
      .then((answers) => {
        this.wallet.walletInfo.nextUnusedAddresses.external = Number(answers['externalIndex']);
        this.wallet.walletInfo.nextUnusedAddresses.change = Number(answers['changeIndex']);
        console.log('sucessfully updated wallet');
        return callback(null); 
      })
  }
}