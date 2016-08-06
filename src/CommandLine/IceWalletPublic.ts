import fs = require('fs');
let unit = require('bitcore-lib').Unit;
let intl = require('intl');
import inquirer = require('inquirer')
import {PublicWalletService} from '../Services/PublicWalletService'
import {PublicWalletInfo} from '../Models/PublicWalletInfo'
import IceWallet from './IceWallet'


export default class IceWalletPublic extends IceWallet {
  wallet:PublicWalletService;
  
  createNewWallet(callback:(err:any,wallet:PublicWalletService) => void){
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
      .then((passwords:any) => {
        if(passwords['password1'] != passwords['password2']){
          return callback('Passwords dont match', null);
        }
        let password = passwords['password1'];
        try {
          var info = new PublicWalletInfo();
          var wallet = new PublicWalletService(info, password.toString());
        }
        catch(err){
          return callback('Could not create wallet, make sure you typed the xpub correctly',null)
        }
        console.log('sucessfully created wallet');
        return callback(null,wallet);
        
      })
  }

  addAccount(callback:(err:any) => void):void {
    inquirer.prompt([
      {
        name:'xpub',
        message:'Enter the BIP32 xub key for your wallet account',
        default:null,
      },
      {
        name:'name',
        message:'Give the account a name',
        default:null,
      },
    ])
    .then((answers:any) => {
      this.wallet.walletInfo.addAccount(answers['xpub'].toString(), answers['name'].toString());
      return callback(null);
    })
  }

  loadWalletFromInfo(callback:(err:any,PublicWalletService:PublicWalletService) => void){
    inquirer.prompt({
      name:'password',
      type:'password',
      message:'enter your password to open the wallet',
    })
    .then((answers:any) => {
      let password = answers['password'].toString();
      console.log('loading and decrypting wallet info from' + this.pathToWalletInfo);
      console.log('this might take a minute');
      fs.readFile(this.pathToWalletInfo, 'hex', (err, data) => {
        if (err){
          return callback(err,null);
        }
        PublicWalletService.openWallet(password, data, (err, info, wallet) => {
          if (err){
            return callback(err, null);
          }
          return callback(null,wallet);
        })
      })
    })
  }
  
  displayAccountMenu(){
    class Choices {
      [key: string]: string;
      initiateWithdraw = 'Initiate Withdraw';
      completeWithdraw = 'Complete Withdraw';
      showBalace = 'Show Balance';
      update = 'Update';
      nextUnusedIndexes = 'Show next Unused Indexes';
      backToMain = 'Back To Main Menu';
      saveAndQuit = 'Save and Quit (dont quit any other way)';
    }

    let choices = new Choices();
    
    console.log('----------' + this.wallet.selectedAccount.name + '----------');
    inquirer.prompt([
      {
        name:'choice',
        type:'list',
        message:'Choose an option',
        choices: Object.keys(choices).map<string>((choice) => choices[choice].toString()),
      }])
      .then((answers:any) => {
        let choice = answers['choice'];
        let done = (err:any) => {
          if (err){
            console.log(err);
          }
          if (choice != choices.saveAndQuit){
            this.displayAccountMenu();
          }
        }
        switch(choice){
          case choices.initiateWithdraw: 
            this.initiateWithdraw(done);
            break;
          case choices.completeWithdraw:
            this.completeWithdraw(done);
            break;
          case choices.showBalace:
            console.log("Balance in bits: " + unit.fromSatoshis(this.wallet.balance).bits.toLocaleString());
            this.displayAccountMenu();
            break;
          case choices.saveAndQuit:
            this.saveAndQuit(done);
            break;
          case choices.backToMain:
            this.displayMainMenu();
            break;
          case choices.update:
            console.log('Updating Wallet...');
            this.wallet.update((err,wallet) => done(err));
            break;
          case choices.nextUnusedIndexes:
            console.log('Change: ' + this.wallet.changeAddresses.length);
            console.log('External: ' + this.wallet.externalAddresses.length);
            this.displayAccountMenu();
            break;
          default:
            this.displayAccountMenu();
        }
      }
    )
  }

  initiateWithdraw(callback:(err:any) => void){
     inquirer.prompt([
      {
        name:'export',
        message:'type the export path',
        when: (answers) => {
          return (!this.pathToUnsignedTransaction)
        },
        filter:(answer) => {
          this.pathToUnsignedTransaction = answer;
          return answer;
        }
      },
      {
        name:'address',
        message:'enter the address to send to',
      },
      {
        name:'amount',
        message:'enter the amount to send in bits',
        validate: amount => {if(!Number.isInteger(Number(amount))) return 'Must be an integer'; else return true}
      }])
      .then((answers:any) => {
        let to = answers['address'];
        let amount = Number(unit.fromBits(answers['amount']).satoshis);
        this.wallet.createTransaction(to, amount, (err, serialized) => {
          if(err){
            return callback(err);
          }
          fs.writeFile(this.pathToUnsignedTransaction, serialized, (err) => {
            if(err){
              return callback(err);
            }
            console.log('transaction written to ' + this.pathToUnsignedTransaction);
            console.log('sign the transaction offline then complete it');
            return callback(null);
          })
      })
    })
  }

  completeWithdraw(callback:(err:any) => void){
    inquirer.prompt([
      {
        name:'import',
        message:'type the import path (path to signed transaction)',
        when: (answers) => {
          return (!this.pathToSignedTransaction)
        },
        filter:(answer) => {
          this.pathToSignedTransaction = answer;
          return answer;
        }
      }])
      .then((answers:any) => {
        fs.readFile(this.pathToSignedTransaction, 'utf8', (err, data) => {
          if (err){
            return callback(err);
          }
          this.wallet.broadcastTransaction(data, (err, txid) => {
          console.log('transaction successfully broadcasted with txid: ' + txid);
          return callback(null)
        })
      })
    })
  }
}