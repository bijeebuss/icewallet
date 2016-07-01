var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
import readline = require('readline');
import {WalletInfo} from './WalletInfo'
import WalletBase from './WalletBase'
import fs = require('fs');
import async = require('async');
import crypto = require('crypto');
let scrypt = require('scrypt');

class PrivateWallet extends WalletBase {
  walletHdPrivKey : any;
  accountHdPrivKey: any;
  pathToInfo:string;
  transactionImportPath:string;
  transactionExportPath:string;
  password:string;
  walletInfo:WalletInfo;

  static cryptoAlgorithm = 'aes-256-ctr';
  static keyLength = 512;
  static slt = 'A55F3D3A-7204-4582-906A-1EC928F79262';

  static loadFromInfo(password:string, path:string, callback:(err,wallet:PrivateWallet) => void){
    fs.readFile(path, 'hex', (err, data) => {
      if (err){
        return callback(err,null);
      }
      scrypt.hash(password, {"N":16,"r":1,"p":1} ,PrivateWallet.keyLength,PrivateWallet.slt, (err, key) => {
        if (err){
          return callback(err,null);
        }
        var decipher = crypto.createDecipher(PrivateWallet.cryptoAlgorithm,key.toString('hex'));
        var dec = decipher.update(data,'hex','utf8')
        dec += decipher.final('utf8');
        var walletInfo:WalletInfo = JSON.parse(dec);
        if(walletInfo.seed == null){
          PrivateWallet.verifySeed(walletInfo, (err,matched) => {
            if (err){
              return callback(err,null)
            }
            var wallet = new PrivateWallet(walletInfo, password, path);
            return callback(null,wallet);
          });
        }
        else{
          var wallet = new PrivateWallet(walletInfo, password, path);
          return callback(null,wallet);
        }
      });
    });
  }

  static verifySeed(info:WalletInfo, callback:(err,matched:boolean) => void){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

    rl.question('the seed is not stored here please enter it now to open the wallet\n', (seed) => {
        rl.close();
        scrypt.verifyKdf(new Buffer(info.seedHash, 'hex'), new Buffer(seed), (err, matched) => {
          if (err){
            return callback (err, false)
          }
          if(!matched){
            return callback('seed entered does not match hash', false);
          }
          //matched
          info.seed = seed;
          return callback(null,true)
        });
    });
  }

  static createNew(password:string, exportPath:string, exportSeed:boolean = false, seed:string = null, externalIndex:number = 0, changeIndex:number = 0) : PrivateWallet{
    if (seed == null){
      seed = new Mnemonic().toString();
    }
    var info = new WalletInfo();
    info.seed = seed;
    info.exportSeed = exportSeed;
    info.nextUnusedAddresses.external = externalIndex;
    info.nextUnusedAddresses.change = changeIndex;
    var wallet = new PrivateWallet(info, password, exportPath);
    wallet.password = password;
    wallet.pathToInfo = exportPath;
    return wallet;
  }

  constructor(walletInfo:WalletInfo, password:string, pathToInfo:string){
    let walletHdPrivKey = (new Mnemonic(walletInfo.seed)).toHDPrivateKey();
    let accountHdPrivKey = walletHdPrivKey.derive("m/44'/0'/0'");
    super(accountHdPrivKey.hdPublicKey.toString());
    this.walletHdPrivKey = walletHdPrivKey;
    this.accountHdPrivKey = accountHdPrivKey;
    this.transactionImportPath = './data/initialTransaction.dat';
    this.transactionExportPath = './data/signedTransaction.dat';
    this.walletInfo = walletInfo;
    this.password = password;
    this.pathToInfo = pathToInfo;
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

  exportInfo(callback:(err) => void){
    async.parallel<string>({
      // generate the encryption key
      cryptoKey: (cb) => {
        scrypt.hash(this.password, {"N":16,"r":1,"p":1} ,PrivateWallet.keyLength,PrivateWallet.slt, (err, key) => {
          if (err){
            return cb(err);
          }
          return cb(null,key.toString('hex'));
        })
      },
      // hash the seed if it isnt being stored
      seedHash: (cb) => {
        if(this.walletInfo.exportSeed){
          return cb(null)
        }
        else{
          var params = scrypt.paramsSync(10, 750000, 0.5);
          scrypt.kdf(this.walletInfo.seed, params, (err, hash) =>{
            if(err){
              return cb(err)
            }
            this.walletInfo.seedHash = hash.toString('hex');
            return cb(null);
          })
        }
      }
    },
    (err,results) => {
      if(err){
        return callback(err);
      }

      // Dont export the seed if asked not to
      if (!this.walletInfo.exportSeed){
        this.walletInfo.seed = null;
      }

      // encrypt the info
      var cipher = crypto.createCipher(PrivateWallet.cryptoAlgorithm,results['cryptoKey']);
      var encrypted = cipher.update(JSON.stringify(this.walletInfo),'utf8','hex')
      encrypted += cipher.final('hex');

      fs.writeFile(this.pathToInfo, new Buffer(encrypted,'hex'), (err) => {
        if (err){
          return callback(err);
        }
        return callback(null);
      })
    });
  }

  deposit(){
    var newAddress = this.address(this.walletInfo.nextUnusedAddresses.external, false);
    console.log('Send coins to:' + newAddress);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Did the transaction complete? y/n\n', (answer) => {
      if(answer == 'y'){
        console.log('good')
        this.walletInfo.nextUnusedAddresses.external += 1;
        this.exportInfo((err) => {
          if(err){
            throw err;
          }
        })
      }
      else if(answer == 'n'){
        console.log('try again');
      }
      else{
        console.log('answer either "y" or "n"');
      }
      rl.close();
    });
  }

  processTransaction(transaction, fee){
    var indexes = this.walletInfo.nextUnusedAddresses;
    var changePrivateKeys   = this.privateKeyRange(0, indexes.change   - 1, true);
    var externalPrivateKeys = this.privateKeyRange(0, indexes.external - 1, false);

    transaction
      .change(this.address(indexes.change, true))
      .fee(fee)
      .sign(externalPrivateKeys.concat(changePrivateKeys));

    // this performs some checks
    transaction.serialize();
  }

  verifyTransaction(transaction, fee, callback:(err) => void){
    console.log('Please verify this transaction');
    transaction.outputs.forEach((output) => {
      console.log('Send: '   + bitcore.Unit.fromSatoshis(output._satoshis).toBTC());
      console.log('To:   '   + output._script.toAddress().toString());
    })

    console.log('Fee:  '   + bitcore.Unit.fromSatoshis(fee).toBTC());

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

    rl.question('answer y/n\n', (answer) => {
        rl.close();
        if(answer == 'y'){
          return callback(null);
        }
        else if(answer == 'n'){
          return callback('user declined transaction');
        }
        else{
          console.log('answer either "y" or "n"');
          return callback('invalid answer');
        }
      });
  }

  completeTransaction(fee:number, callback:(err,transaction)=>void){
    fs.readFile(this.transactionImportPath,'utf8', (err, results) => {
      if(err){
        return callback(err, null);
      }
      var transaction = new bitcore.Transaction(JSON.parse(results));

      this.verifyTransaction(transaction, fee, (err) => {
        if (err){
          return callback(err, transaction);
        }

        // add the fee, change address and sign it
        this.processTransaction(transaction, fee);

        if (!transaction.isFullySigned()){
          return callback('transaction is not fully signed, check yourself before you wreck yourself', transaction);
        }

        // export the signed transaction
        fs.writeFile(this.transactionExportPath, JSON.stringify(transaction.toObject()), (err) => {
          if(err){
            return callback(err, transaction);
          }
          // update the change index count
          this.walletInfo.nextUnusedAddresses.change += 1;
          this.exportInfo((err) => {
            if(err){
              return callback(err, transaction);
            }
            console.log('transaction successfully signed and written to ' + this.transactionExportPath);
            return callback(null, transaction);
          })
        })
      })
    })
  }
}

export {PrivateWallet};