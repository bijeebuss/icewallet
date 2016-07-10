var bitcore = require('bitcore-lib');
import async = require('async');
import {InsightService} from '../Services/InsightService';
import * as BM from '../Models/BitcoreModels';
import WalletService from './WalletService';

class PublicWalletService extends WalletService {
  insightService:InsightService;
  transactions:BM.Transaction[];
  changeAddresses:BM.AddressInfo[];
  externalAddresses:BM.AddressInfo[];
  lastUpdated:Date;

  constructor(publicKey: string, password:string)
  {
    super(publicKey, password);
    this.insightService = new InsightService('https://insight.bitpay.com/api/');
    this.transactions = [];
    this.changeAddresses= []; 
    this.externalAddresses = [];
    this.lastUpdated = new Date();
  }
  
  static openWallet(password:string, encryptedInfo:string, callback:(err, info:string, wallet:PublicWalletService) => void){
    this.cryptoService.decrypt(password, encryptedInfo, (err, decrypted) => {
      if (err){
        return callback(err,null,null);
      }
      try {
        var wallet = new PublicWalletService(decrypted, password);
      }
      catch(err){
        return callback('Could not create wallet, check your xpub',decrypted,null);
      }
      return callback(null, decrypted, wallet);
    });
  }

  public get balance() : number {
    var changeBalance = 0;
    var externalBalance = 0;
    if (this.changeAddresses.length > 0){
      changeBalance = this.changeAddresses.map((addr) => addr.balanceSat).reduce((p,c) => c + p);
    }
    if (this.externalAddresses.length > 0){
      externalBalance = this.externalAddresses.map((addr) => addr.balanceSat).reduce((p,c) => c + p);
    }
    return changeBalance + externalBalance;
  }

  getAddressInfo(index:number, change:boolean, callback:(error: any, info:BM.AddressInfo) => void){
    var address = this.address(index,change);
    this.insightService.getAddressInfo(address, (err, resp, body) => {
      if (err){
        return callback(err, null);
      }
      return callback(null, JSON.parse(body));
    })
  }

  getTransactions(change:boolean, callback: (error: any, transactions: BM.Transaction[]) => void){
    var startingAddress = 0;
    var addrs = this.addressRange(startingAddress,startingAddress + 19, change);
    var self = this;

    function combine(err,resp,body){
      if (err){
        return callback(err,null);
      }
      var transactions:BM.Transaction[] = JSON.parse(body).items;
      // if there is still nonempty addresses
      if (transactions.length > 0){
        // combine them
        transactions.forEach((utxo) => self.transactions.push(utxo));
        //increment the starting address
        startingAddress += 20;
        addrs = self.addressRange(startingAddress, startingAddress + 19, change);
        // call the service again and repeat
        self.insightService.getTransactions(addrs, combine);
      }
      else {
        return callback(err,transactions)
      }
    }

    this.insightService.getTransactions(addrs, combine);
  }

  getAddresses(change:boolean, callback:(error:any, addrs:BM.AddressInfo[]) => void){
    // max number of concurrent requests
    var maxConcurrency = 3;
    // when to stop looking for transactions
    var maxUnusedAddresses = 5;
    // setup initial variables
    var index = 0;
    var emptyAddressCount = 0;
    var addresses:BM.AddressInfo[] = [];
    var errors:any[] = [];

    function taskCallback(error:any){
      if (error){
        return errors.push(error);
      }
    }
    //create the queue with concurrency
    var q = async.queue<any>((task, callback) => {
      this.getAddressInfo(task.index, change, (err, address) => {
        if(err){
          return callback(err)
        }
        if(address.txApperances == 0){
          emptyAddressCount++
        }
        else {
          addresses[task.index] = address;
        }
        // kick off a new task with the next index
        if(emptyAddressCount < maxUnusedAddresses){
          q.push({index:index}, taskCallback);
        }
        index++;
        return callback();
      })
    }, maxConcurrency)
    // kick off initial tasks
    for(index = 0; index < maxConcurrency; index++){
      q.push({index:index}, taskCallback)
    }
    // setup the final callback
    q.drain = () => {
      return callback(errors.length > 0 ? errors : null, addresses);
    }
  }

  update(callback:(error:any, wallet:PublicWalletService) => void){
    async.series<BM.AddressInfo[]>([
      (cb) => this.getAddresses(false, cb),
      (cb) => this.getAddresses(true, cb),
    ],(err, results) => {
      if (err){
        return callback(err,null)
      }
      this.externalAddresses = results[0];
      this.changeAddresses = results[1];
      return callback(null, this);
    })
  }

  createTransaction(to:string, amount:number, callback:(err,serializedTransaction:string) => void){
    var addrs:string[] = [];
    var total:number = 0;
    var standardFee = 15000;
    var addrsWithBalance = this.externalAddresses.concat(this.changeAddresses)
      .filter((addr) => addr.balanceSat > 0);

    addrsWithBalance.forEach((addr) => {
      if (total < amount + standardFee){
        addrs.push(addr.addrStr);
        total += addr.balanceSat;
      }
    })

    if(total < amount + standardFee){
      return callback('you dont have enough coins for this transaction plus a fee', null);
    }

    this.insightService.getUtxos(addrs, (err, utxos) => {
      if (err){
        return callback(err, null);
      }
      var utxosForTransaction =  utxos.map((utxo) => {
        return {
          address: utxo.address,
          txId: utxo.txid,
          outputIndex: utxo.vout,
          script: utxo.scriptPubKey,
          satoshis: utxo.satoshis
        }
      })

      var transaction = new bitcore.Transaction()
        .from(utxosForTransaction)  // Feed information about what unspent outputs one can use
        .to(to, amount)        // Add an output with the given amount of satoshis

      return callback(null, JSON.stringify(transaction.toObject()));
    })
  }

  broadcastTransaction(serializedTransaction:string, callback:(err, txid) => void){
    var transaction = new bitcore.Transaction(JSON.parse(serializedTransaction));
    this.insightService.broadcastTransaction(transaction.serialize(),callback);
  }

  exportInfo(callback:(err, encryptedInfo:string) => void){
    // derive the encryption key
    PublicWalletService.cryptoService.deriveKey(this.password, (err,key) => {
    if(err){
      return callback(err,null);
    }

    let encrypted = PublicWalletService.cryptoService.encrypt(key, this.hdPublicKey.toString());
    return callback(null, encrypted);
    });
  }
}

export {PublicWalletService}
