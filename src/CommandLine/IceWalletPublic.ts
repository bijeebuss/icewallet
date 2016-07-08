import fs = require('fs');
import inquirer = require('inquirer')
import {PublicWalletService} from '../Services/PublicWalletService'

export default class IceWalletPublic {
  wallet:PublicWalletService;
  
constructor(
    public pathToWalletInfo:string, 
    public pathToUnsignedTransaction:string, 
    public pathToSignedTransaction:string,
    newWallet:boolean,
    callback?:(err,wallet:IceWalletPublic) => void) {
      
      let done = (err,wallet:PublicWalletService) => {
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

  displayMenu(){
    var choices = ['Initiate Withdraw', 'Complete Withdraw', 'Save and Quit (dont quit any other way)' ]
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
        validate:(fee) => {if(!Number.isInteger(Number(fee))) return 'Must be an integer'; else return true}
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

  saveInfo(encrypted:string, callback:(err) => void){
    fs.writeFile(this.pathToWalletInfo, new Buffer(encrypted,'hex'), (err) => {
      if (err){
        return callback(err);
      }
      return callback(null);
    })
  }
}