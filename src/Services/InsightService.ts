import request = require('request');

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
    var req = request.post('addrs/txs/', opts, callback)
  }
}

export {InsightService}