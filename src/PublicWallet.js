var bitcore = require('bitcore-lib');
var request = require('request');
var PublicWallet = (function () {
    function PublicWallet(publicKey) {
        this.insightUrl = 'https://insight.bitpay.com/api/';
        this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
    }
    PublicWallet.prototype.getAddress = function (index) {
        return new bitcore.Address(this.hdPublicKey.derive(0).derive(index).publicKey);
    };
    PublicWallet.prototype.getBalance = function () {
        request.get('https://insight.bitpay.com/api/addr/1BbRFw5nvkZDRK56qtCvcy1yFR3Q2nWPgf', function (response) { return console.log(response); });
    };
    return PublicWallet;
})();
exports.PublicWallet = PublicWallet;
//# sourceMappingURL=PublicWallet.js.map