var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
var request = require('request');
var Wallet = (function () {
    function Wallet(seed) {
        this.insightUrl = 'https://insight.bitpay.com/api/';
        var mnemonic = new Mnemonic(seed);
        this.masterPrivKey = mnemonic.toHDPrivateKey();
        this.accountPrivKey = this.masterPrivKey.derive("m/44'/0'/0'");
    }
    Wallet.prototype.getAddress = function (index) {
        return this.accountPrivKey.derive(0).derive(index).privateKey.toAddress();
    };
    Wallet.prototype.getBalance = function () {
        request.get('https://insight.bitpay.com/api/addr/1BbRFw5nvkZDRK56qtCvcy1yFR3Q2nWPgf');
    };
    return Wallet;
})();
exports.Wallet = Wallet;
//# sourceMappingURL=wallet.js.map