var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
import request = require('request');

class PrivateWallet {
  masterHdPrivKey : any;
  accountHdPrivKey: any;

  constructor(seed: string){
    var mnemonic = new Mnemonic(seed);
    this.masterHdPrivKey = mnemonic.toHDPrivateKey();
    this.accountHdPrivKey = this.masterHdPrivKey.derive("m/44'/0'/0'");
  }

}

export {PrivateWallet};