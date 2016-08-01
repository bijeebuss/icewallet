var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
import {Deserialize, Serialize} from 'cerialize'
import {PrivateWalletInfo} from '../Models/PrivateWalletInfo'
import TransactionInfo from '../Models/TransactionInfo' 
import WalletService from './WalletService'
import async = require('async');

export default class PrivateWalletService extends WalletService {
  walletHdPrivKey : any;
  walletInfo:PrivateWalletInfo;
  
  get accountHdPrivKey():any {
    return this.walletHdPrivKey.derive("m/44'/0'").derive(this.selectedAccount.index,true);
  }
  
  get nextChangeIndex():number {
      return this.selectedAccount.nextChangeIndex;
  }
  set nextChangeIndex(value:number) {
      this.selectedAccount.nextChangeIndex = value;
  }

  get nextExternalIndex():number {
      return this.selectedAccount.nextExternalIndex;
  }
  set nextExternalIndex(value:number) {
      this.selectedAccount.nextExternalIndex = value;
  }

  static openWallet(password:string, encryptedInfo:string, callback:(err:any, info:PrivateWalletInfo, wallet:PrivateWalletService) => void){
    this.cryptoService.decrypt(password, encryptedInfo, (err, decrypted) => {
      if (err){
        return callback(err,null,null);
      }
      try {
        var json = JSON.parse(decrypted);
        var walletInfo:PrivateWalletInfo = Deserialize(json, PrivateWalletInfo);
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

  static seedWallet(password:string, info:PrivateWalletInfo, seed:string, callback:(err:any,wallet:PrivateWalletService) => void){
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
    return this.address(this.nextExternalIndex, false);
  }

  incrementChangeIndex(){
    this.nextChangeIndex += 1;
  }

  incrementExternalIndex(){
    this.nextExternalIndex += 1;
  }

  exportInfo(callback:(err:any, encryptedInfo:string) => void){
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
      var serialized = Serialize(this.walletInfo);
      var stringified = JSON.stringify(serialized);
      let encrypted = PrivateWalletService.cryptoService.encrypt(results['cryptoKey'], stringified);
      return callback(null, encrypted);
    });
  }

  parseTransaction(serializedTransaction:string):TransactionInfo{
    var transaction = new bitcore.Transaction(JSON.parse(serializedTransaction));
    var info = new TransactionInfo();
    info.outputTotals = {};
    transaction.outputs.forEach((output:any) => {
      info.outputTotals[output._script.toAddress().toString()] = output._satoshis;
    })
    return info;
  }

  completeTransaction(serializedTransaction:string, fee:number):string{
    var transaction = new bitcore.Transaction(JSON.parse(serializedTransaction));
    var changePrivateKeys   = this.privateKeyRange(0, this.nextChangeIndex - 1, true);
    var externalPrivateKeys = this.privateKeyRange(0, this.nextExternalIndex - 1, false);

    transaction
      .change(this.address(this.nextChangeIndex, true))
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
