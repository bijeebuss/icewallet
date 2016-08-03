import WalletService from '../Services/WalletService';
import fs = require('fs');
import inquirer = require('inquirer');

abstract class IceWallet {
  wallet:WalletService
  
  constructor(
    public pathToWalletInfo:string, 
    public pathToUnsignedTransaction:string, 
    public pathToSignedTransaction:string,
    newWallet:boolean,
    callback?:(err:any,wallet:IceWallet) => void) {
      
      let done = (err:any, wallet:WalletService) => {
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
        this.displayMainMenu();
      }
      
      if(newWallet){
        this.createNewWallet(done)
      }
      else{
        console.log('loading and decryting wallet from ' + this.pathToWalletInfo)
        this.loadWalletFromInfo(done);
      }
  }

  displayMainMenu(){
    let hasAccounts:boolean = this.wallet.walletInfo.accounts.length > 0;
    class Choices {
      [key: string]: string;
      selectAccount:string;
      addAccount:string;
      saveAndQuit:string;
      constructor(){
        if(hasAccounts){
          this.selectAccount = 'Select Account';
        }
        this.addAccount = 'Add a New Account';
        this.saveAndQuit = 'Save and Quit (dont quit any other way)';
      }
    }
    let choices = new Choices();
    inquirer.prompt([
      {
        name:'choice',
        type:'list',
        message:'Choose an option',
        choices: Object.keys(choices).map<string>(choice => choices[choice])
      },
      {
        name:'account',
        type:'list',
        message:'Choose an existing account',
        when: answers => answers['choice'] == choices.selectAccount,
        validate: account => {
          if (!account) 
            return 'Create an account first'; 
          else return true
        },
        choices: this.wallet.walletInfo.accounts.map(account => account.name),
      }])
      .then((answers:any) => {
        let choice:string = answers['choice'];
        let account:string = answers['account'];
        let done = (err:any) => {
          if (err){
            console.log(err);
          }
          if (choice == choices.addAccount){
            this.displayMainMenu();
          }
          else if (choice == choices.selectAccount){
            this.displayAccountMenu();
          }
        }
        switch(choice){
          case choices.selectAccount: 
            this.wallet.switchAccount(account, done);
            break;
          case choices.addAccount:
            this.addAccount(done);
            break;
          case choices.saveAndQuit:
            this.saveAndQuit(done);
            break;
          default:
            this.displayMainMenu();
        }
      })
  }

  saveAndQuit(callback:(err:any) => void){
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

  saveInfo(encrypted:string, callback:(err:any) => void){
    fs.writeFile(this.pathToWalletInfo, new Buffer(encrypted,'hex'), (err) => {
      if (err){
        return callback(err);
      }
      return callback(null);
    })
  }

  abstract addAccount(callback:(err:any) => void):void;
  abstract displayAccountMenu():void;
  abstract createNewWallet(callback:(err:any, WalletService:WalletService) => void):void;
  abstract loadWalletFromInfo(callback:(err:any, WalletService:WalletService) => void):void;
}

export default IceWallet