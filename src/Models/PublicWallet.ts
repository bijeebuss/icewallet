var bitcore = require('bitcore-lib');
import async = require('async');
import {InsightService} from "../Services/InsightService"
import * as BM from "./BitcoreModels"

class PublicWallet {
  insightService:InsightService = new InsightService('https://insight.bitpay.com/api/');
  hdPublicKey:any;
  utxos:BM.Utxo[] = [];
  lastUpdated:Date = new Date();
  
  public get balance() : number {
    return  this.utxos.map((utxo) => utxo.amount).reduce((p,c) => c + p);
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
  
  getUtxos(change:boolean, callback: (error: any, utxos: BM.Utxo[]) => void){
    var startingAddress = 0;
    var addrs = this.getAddressRange(startingAddress,startingAddress + 19, change);
    var self = this;
    
    function combineUtxos(err,resp,body){
      if (err){
        callback(err,null);
        return;
      }
      var utxos:BM.Utxo[] = JSON.parse(body);
      // if there is still nonempty addresses
      if (utxos.length > 0){
        // combine them
        utxos.forEach((utxo) => self.utxos.push(utxo));
        //increment the starting address
        startingAddress += 20;
        addrs = self.getAddressRange(startingAddress, startingAddress + 19, change);
        // call the service again and repeat
        self.insightService.getUtxos(addrs, combineUtxos);
      }
      else {
        callback(err,self.utxos)
      }
    }
    
    this.insightService.getUtxos(addrs, combineUtxos);
  }
  
  update(callback:(error: any, wallet:PublicWallet) => void){
    async.parallel([
      (callback) => this.getUtxos(false,callback),
      (callback) => this.getUtxos(true,callback)
    ], 
      (err, result) => {
        this.lastUpdated = new Date(Date.now());
        callback(err, this);
      })
  }
}


export {PublicWallet};
