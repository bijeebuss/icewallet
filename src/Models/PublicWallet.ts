var bitcore = require('bitcore-lib');
import {InsightService} from "../Services/InsightService"
import request = require('request');

class PublicWallet {
  hdPublicKey:any;

  insightService:InsightService = new InsightService('https://insight.bitpay.com/api/');

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

  getAddressBalance(index:number, change:boolean, callback:request.RequestCallback){
    var address = this.getAddress(index,change).toString()
    this.insightService.getAddressInfo(address, callback)
  }
  
  getWalletBalance(callback:request.RequestCallback){
    var startingAddress = 0;
    var addrs = this.getAddressRange(startingAddress,startingAddress + 19,false);
    var allUtxos = [];
    var self = this;
    
    function combineUtxos(err,resp,body){
      if (err){
        console.log(err)
        return;
      }
      var utxos:any[] = JSON.parse(body);
      if (utxos.length > 0){
        allUtxos.push(utxos);
        startingAddress += 20;
        addrs = self.getAddressRange(startingAddress, startingAddress + 19, false);
        self.insightService.getUtxos(addrs, combineUtxos);
      }
      else {
        callback(err,resp,allUtxos)
      }
    }
    
    this.insightService.getUtxos(addrs, combineUtxos);
  }
}


export {PublicWallet};
