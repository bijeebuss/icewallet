import WalletService from '../Services/WalletService';
import fs = require('fs');

abstract class IceWallet {
  wallet:WalletService
  
  constructor(
    public pathToWalletInfo:string, 
    public pathToUnsignedTransaction:string, 
    public pathToSignedTransaction:string,
    newWallet:boolean,
    callback?:(err,wallet:IceWallet) => void) {
      
      let done = (err, wallet:WalletService) => {
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
        this.displayMenu();
      }
      
      if(newWallet){
        this.createNewWallet(done)
      }
      else{
        console.log('loading and decryting wallet from ' + this.pathToWalletInfo)
        this.loadWalletFromInfo(done);
      }
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

  abstract displayMenu();
  abstract createNewWallet(callback:(err, WalletService) => void);
  abstract loadWalletFromInfo(callback:(err, WalletService) => void);
}

export default IceWallet