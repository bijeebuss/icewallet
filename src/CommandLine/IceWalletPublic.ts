import fs = require('fs');
import inquirer = require('inquirer')
import {PublicWalletService} from '../Services/PublicWalletService'
import IceWallet from './IceWallet'

export default class IceWalletPublic extends IceWallet {
  wallet:PublicWalletService;
  
  createNewWallet(callback:(err,wallet:PublicWalletService) => void){
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
            name:'xpub',
            message:'Please type the BIP32 xub key for your wallet account',
            default:null,
          },
        ])
        .then((answers) => {
          let wallet = new PublicWalletService(answers['xpub'].toString(), password.toString());
          console.log('sucessfully created wallet');
          console.log("updating wallet...");
          wallet.update(callback);
        })
      })
  }

  loadWalletFromInfo(callback:(err,PublicWalletService) => void){
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
        PublicWalletService.openWallet(password, data, (err, info, wallet) => {
          if (err){
            return callback(err, null);
          }
          console.log("updating wallet...");
          return wallet.update(callback);
        })
      })
    })
  }
  
  displayMenu(){
    var choices = ['Initiate Withdraw', 'Complete Withdraw','Show Balance', 'Save and Quit (dont quit any other way)' ]
    inquirer.prompt([
      {
        name:'choice',
        type:'list',
        message:'Choose an option',
        choices:choices,
      },
      {
        name:'address',
        message:'enter the address to send to',
        when: (answers) => {
          return answers['choice'] == choices[0]
        },
      },
      {
        name:'amount',
        message:'enter the amount to send in satoshis',
        when: (answers) => {
          return answers['choice'] == choices[0]
        },
        validate:(fee) => {if(!Number.isInteger(Number(fee))) return 'Must be an integer'; else return true}
      }])
      .then((answers) => {
        let choice = answers['choice'];
        let done = (err) => {
          if (err){
            console.log(err);
          }
          this.displayMenu();
        }
        
        if(choice == choices[0]){
          let amount = Number(answers['amount']);
          let toAddress = answers['address'].toString();
          this.initiateWithdraw(toAddress, amount, done);
        }
        else if(choice == choices[1]){
          this.completeWithdraw(done);
        }
        else if(choice == choices[2]){
          console.log("Balance in satoshis: " + this.wallet.balance);
          this.displayMenu();
        }
        else if(choice == choices[3]){
          this.saveAndQuit(done);
        }
        else{
          this.displayMenu();
        }
      }
    )
  }

  initiateWithdraw(to:string, amount:number, callback:(err) => void){
    this.wallet.createTransaction(to, amount, (err, serialized) => {
      fs.writeFile(this.pathToUnsignedTransaction, serialized, (err) => {
        if(err){
          return callback(err);
        }
        console.log('transaction written to ' + this.pathToUnsignedTransaction);
        console.log('sign the transaction offline then complete it');
        return callback(null);
      })
    })
  }

  completeWithdraw(callback:(err) => void){
    fs.readFile(this.pathToSignedTransaction, 'utf8', (err, data) => {
      if (err){
        return callback(err);
      }
      this.wallet.broadcastTransaction(data, (err, txid) => {
        console.log('transaction successfully broadcasted with txid: ' + txid);
        return callback(null)
      })
    })
  }
}