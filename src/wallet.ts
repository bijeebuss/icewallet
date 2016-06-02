var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
import request = require('request');

class Wallet {
  masterPrivKey : any;
  accountPrivKey: any;

  insightUrl:string = 'https://insight.bitpay.com/api/';

  constructor(seed: string){
    var mnemonic = new Mnemonic(seed);
    this.masterPrivKey = mnemonic.toHDPrivateKey();
    this.accountPrivKey = this.masterPrivKey.derive("m/44'/0'/0'");
  }

  // returns an address of the given index
  getAddress(index:number):any{
    return this.accountPrivKey.derive(0).derive(index).privateKey.toAddress();
  }

  getBalance(){
    request.get('https://insight.bitpay.com/api/addr/1BbRFw5nvkZDRK56qtCvcy1yFR3Q2nWPgf')
  }
}

export {Wallet};
