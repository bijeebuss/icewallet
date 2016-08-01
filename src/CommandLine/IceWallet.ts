import WalletService from '../Services/WalletService';
import fs = require('fs');

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

  abstract displayMainMenu():void;
  abstract displayAccountMenu():void;
  abstract createNewWallet(callback:(err:any, WalletService:WalletService) => void):void;
  abstract loadWalletFromInfo(callback:(err:any, WalletService:WalletService) => void):void;
}

export default IceWallet