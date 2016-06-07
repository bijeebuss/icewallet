var bitcore = require('bitcore-lib');
import async = require('async');
import {InsightService} from "../Services/InsightService"
import * as BM from "./BitcoreModels"

class PublicWallet {
  insightService:InsightService = new InsightService('https://insight.bitpay.com/api/');
  hdPublicKey:any;
  transactions:BM.Transaction[] = [];
  lastUpdated:Date = new Date();
  
  public get balance() : number {
    return  this.transactions.map((utxo) => utxo.amount).reduce((p,c) => c + p);
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

  getAddressBalance(index:number, change:boolean, callback:(error: any, resp:any, body:any) => void){
    var address = this.getAddress(index,change).toString()
    this.insightService.getAddressInfo(address, callback)
  }
  
  getTransactions(change:boolean, callback: (error: any, transactions: BM.Transaction[]) => void){
    var startingAddress = 0;
    var addrs = this.getAddressRange(startingAddress,startingAddress + 19, change);
    var self = this;
    
    function combine(err,resp,body){
      if (err){
        callback(err,null);
        return;
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
        callback(err,transactions)
      }
    }
    
    this.insightService.getTransactions(addrs, combine);
  }
  
  update(callback:(error: any, wallet:PublicWallet) => void){
    async.parallel([
      (callback) => this.getTransactions(false,callback),
      (callback) => this.getTransactions(true,callback)
    ], 
      (err, result) => {
        this.lastUpdated = new Date(Date.now());
        callback(err, this);
      })
  }
}


export {PublicWallet};
