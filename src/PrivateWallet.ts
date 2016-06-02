var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
import request = require('request');

class PrivateWallet {
  masterPrivKey : any;
  accountPrivKey: any;

  constructor(seed: string){
    var mnemonic = new Mnemonic(seed);
    this.masterPrivKey = mnemonic.toHDPrivateKey();
    this.accountPrivKey = this.masterPrivKey.derive("m/44'/0'/0'");
  }

}

export {PrivateWallet};