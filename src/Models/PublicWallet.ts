var bitcore = require('bitcore-lib');
import async = require('async');
import {InsightService} from "../Services/InsightService"
import * as BM from "./BitcoreModels"
import fs = require('fs');

class PublicWallet {
  insightService:InsightService = new InsightService('https://insight.bitpay.com/api/');
  transactionExportPath:string = './data/initialTransaction.dat'
  hdPublicKey:any;
  transactions:BM.Transaction[] = [];
  changeAddresses:BM.AddressInfo[] = [];
  externalAddresses:BM.AddressInfo[] = [];
  lastUpdated:Date = new Date();

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

  constructor(publicKey: string){
    this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
  }

  // returns an address of the given index
  getAddress(index:number, change:boolean):any{
    var chain:number = change ? 1 : 0;
    return new bitcore.Address(this.hdPublicKey.derive(chain).derive(index).publicKey);
  }

  getAddressRange(start:number, end:number, change:boolean):string[]{
    var addresses:string[] = [];
    for (var i:number = start; i <= end; i++){
      addresses.push(this.getAddress(i,change).toString());
    }
    return addresses;
  }

  getAddressInfo(index:number, change:boolean, callback:(error: any, info:BM.AddressInfo) => void){
    var address = this.getAddress(index,change).toString()
    this.insightService.getAddressInfo(address, (err, resp, body) => {
      if (err){
        return callback(err, null);
      }
      return callback(null, JSON.parse(body));
    })
  }

  getTransactions(change:boolean, callback: (error: any, transactions: BM.Transaction[]) => void){
    var startingAddress = 0;
    var addrs = this.getAddressRange(startingAddress,startingAddress + 19, change);
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
        addrs = self.getAddressRange(startingAddress, startingAddress + 19, change);
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

  // update(callback:(error: any, wallet:PublicWallet) => void){
  //   async.parallel([
  //     (callback) => this.getTransactions(false,callback),
  //     (callback) => this.getTransactions(true,callback)
  //   ],
  //     (err, result) => {
  //       this.lastUpdated = new Date(Date.now());
  //       callback(err, this);
  //     })
  // }

  update(callback:(error:any, wallet:PublicWallet) => void){
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

  createTransaction(to:string, amount:number, callback:(err,transaction) => void){
    var addrs:string[] = [];
    var total:number = 0;
    this.externalAddresses.filter((addr) => addr.balanceSat > 0).forEach((addr) => {
      if (total < amount){
        addrs.push(addr.addrStr);
        total += addr.balanceSat;
      }
    })

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

      return callback(null, transaction);
    })
  }

  initiateTransaction(to:string, amount:number, callback:(err,transaction)=>void){
    this.createTransaction(to,amount, (err, transaction) => {
      if (err){
        return callback(err,null);
      }
      fs.writeFile(this.transactionExportPath, transaction.uncheckedSerialize(), (err) => {
        if(err){
          return callback(err,transaction);
        }
        console.log('transaction written to ' + this.transactionExportPath);
        console.log('sign the transaction offline then complete it');
        return callback(null,transaction);
      })
    })
  }

  broadcastTransaction(transaction, callback:(err, txid) => void){
    this.insightService.broadcastTransaction(transaction.serialize(),callback);
  }
}


export {PublicWallet};
