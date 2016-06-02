var bitcore = require('bitcore-lib');
import request = require('request');

class PublicWallet {
  hdPublicKey:any;

  insightUrl:string = 'https://insight.bitpay.com/api/';

  constructor(publicKey: string){
    this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
  }

  // returns an address of the given index
  getAddress(index:number):any{
    return new bitcore.Address(this.hdPublicKey.derive(0).derive(index).publicKey);
  }

  getBalance(){
    request.get('https://insight.bitpay.com/api/addr/1BbRFw5nvkZDRK56qtCvcy1yFR3Q2nWPgf',
      (response) => console.log(response)
    )
  }
}

export {PublicWallet};
