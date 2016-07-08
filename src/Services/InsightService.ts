import request = require('request');
import * as BM from '../Models/BitcoreModels'

class InsightService {
  constructor(
    public baseUrl:string
  ){}
  
  getAddressInfo(address:string, callback:request.RequestCallback){
    request.get(this.baseUrl + 'addr/' +  address, callback)
  } 
  
  getTransactions(addresses:string[], callback:request.RequestCallback){
    var addrs = addresses.reduce((prev, cur) => {return cur + ',' + prev} )
    
    var opts:request.CoreOptions = {
      baseUrl:this.baseUrl,
      body: JSON.stringify({addrs:addrs}),
      headers: {
        "Content-Type":"application/json"
      }
    }
    var req = request.post('addrs/', opts, callback)
  }
  
  getUtxos(addresses:string[], callback:(err, utxos:BM.Utxo[]) => void){
    var addrs = addresses.reduce((prev, cur) => {return cur + ',' + prev} )
    
    var opts:request.CoreOptions = {
      baseUrl:this.baseUrl,
      body: JSON.stringify({addrs:addrs}),
      headers: {
        "Content-Type":"application/json"
      }
    }
    var req = request.post('addrs/utxo', opts, (err,resp,body) => {
     if (err){
       return callback(err, null);
     } 
     return callback(null, JSON.parse(body));
    })
  }
  
  broadcastTransaction(transaction:string, callback:(err, txid) => void){
    var opts:request.CoreOptions = {
      baseUrl:this.baseUrl,
      body: JSON.stringify({rawtx:transaction}),
      headers: {
        "Content-Type":"application/json"
      }
    }
    var req = request.post('tx/send', opts, (err,resp,body) => {
     if (err){
       return callback(err, null);
     } 
     return callback(null, JSON.parse(body).txid);
    })
  }
}

export {InsightService}