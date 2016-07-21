var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');


import {PrivateWalletInfo} from '../Models/PrivateWalletInfo'
import TransactionInfo from '../Models/TransactionInfo' 
import WalletService from './WalletService'
import async = require('async');

export default class PrivateWalletService extends WalletService {
  walletHdPrivKey : any;
  walletInfo:PrivateWalletInfo;
  
  get accountHdPrivKey():any {
    return this.walletHdPrivKey.derive("m/44'/0'").derive(this.selectedAccountIndex,true);
  }
  get nextChangeIndex():number {
      return this.walletInfo.accounts[this.selectedAccountIndex].nextChangeIndex;
  }
  get nextExternalIndex():number {
      return this.walletInfo.accounts[this.selectedAccountIndex].nextExternalIndex;
  }

  static openWallet(password:string, encryptedInfo:string, callback:(err, info:PrivateWalletInfo, wallet:PrivateWalletService) => void){
    this.cryptoService.decrypt(password, encryptedInfo, (err, decrypted) => {
      if (err){
        return callback(err,null,null);
      }
      try {
        var walletInfo:PrivateWalletInfo = JSON.parse(decrypted);
      }
      catch(err){
        return callback('cannot open wallet, make sure your password is correct',null,null)
      }
      if(walletInfo.seed == null){
        return callback('SEED_MISSING', walletInfo, null);
      }
      else {
        var wallet = new PrivateWalletService(walletInfo, password);
        return callback(null, walletInfo, wallet);
      }
    });
  }

  static seedWallet(password:string, info:PrivateWalletInfo, seed:string, callback:(err,wallet:PrivateWalletService) => void){
    this.cryptoService.verifyHash(info.seedHash, seed, (err, matched) => {
      if (err){
        return callback (err, null)
      }
      if(!matched){
        return callback('seed entered does not match hash', null);
      }
      //matched
      info.seed = seed;
      var wallet = new PrivateWalletService(info, password);
      return callback(null, wallet)
    });
  }

  constructor(walletInfo:PrivateWalletInfo, password:string){
    if (!walletInfo.seed){
      walletInfo.seed = new Mnemonic().toString();
    }
    let walletHdPrivKey = (new Mnemonic(walletInfo.seed)).toHDPrivateKey();
    super(walletInfo, password);
    this.walletHdPrivKey = walletHdPrivKey;
  }

  hdPrivateKey(index:number, change:boolean):any{
    var chain:number = change ? 1 : 0;
    return this.accountHdPrivKey.derive(chain).derive(index);
  }

  privateKeyRange(start:number, end:number, change:boolean):string[]{
    var keys:string[] = [];
    for (var i:number = start; i <= end; i++){
      keys.push(this.hdPrivateKey(i,change).privateKey.toString());
    }
    return keys;
  }

  getDepositAddress():string{
    return this.address(this.walletInfo.nextUnusedAddresses.external, false);
  }

  incrementChangeIndex(){
    this.walletInfo.nextUnusedAddresses.change += 1;
  }

  incrementExternalIndex(){
    this.walletInfo.nextUnusedAddresses.external += 1;
  }

  exportInfo(callback:(err, encryptedInfo:string) => void){
    // we can derive the key and hash the seed in parallel
    async.parallel<string>({
      // derive the encryption key
      cryptoKey: (cb) => PrivateWalletService.cryptoService.deriveKey(this.password, cb),
      // dont hash the seed if its already computed or being exported plain text
      seedHash: (cb) => {
        if(this.walletInfo.seedHash || this.walletInfo.exportSeed){
          return cb(null)
        }
        else{
          PrivateWalletService.cryptoService.hash(this.walletInfo.seed, (err, hash) => {
            if(err){
              return cb(err);
            }
            this.walletInfo.seedHash = hash;
            return cb(null, hash);
          });
        }
      }
    },
    (err,results) => {
      if(err){
        return callback(err,null);
      }
      // copy the info
      var exportInfo = new WalletInfo();
      exportInfo.exportSeed = this.walletInfo.exportSeed;
      exportInfo.seedHash = this.walletInfo.seedHash;
      exportInfo.seed = this.walletInfo.exportSeed ? this.walletInfo.seed : null;
      exportInfo.nextUnusedAddresses.change = this.walletInfo.nextUnusedAddresses.change;
      exportInfo.nextUnusedAddresses.external = this.walletInfo.nextUnusedAddresses.external;

      let encrypted = PrivateWalletService.cryptoService.encrypt(results['cryptoKey'], JSON.stringify(exportInfo));
      return callback(null, encrypted);
      
    });
  }

  parseTransaction(serializedTransaction:string):TransactionInfo{
    var transaction = new bitcore.Transaction(JSON.parse(serializedTransaction));
    var info = new TransactionInfo();
    info.outputTotals = {};
    transaction.outputs.forEach((output) => {
      info.outputTotals[output._script.toAddress().toString()] = output._satoshis;
    })
    return info;
  }

  completeTransaction(serializedTransaction:string, fee):string{
    var transaction = new bitcore.Transaction(JSON.parse(serializedTransaction));
    var indexes = this.walletInfo.nextUnusedAddresses;
    var changePrivateKeys   = this.privateKeyRange(0, indexes.change   - 1, true);
    var externalPrivateKeys = this.privateKeyRange(0, indexes.external - 1, false);

    transaction
      .change(this.address(indexes.change, true))
      .fee(fee)
      .sign(externalPrivateKeys.concat(changePrivateKeys));
    // this performs some checks
    transaction.serialize();

    if (!transaction.isFullySigned()){
      throw 'transaction is not fully signed, check yourself before you wreck yourself';
    }
    return JSON.stringify(transaction.toObject());
  }
}
