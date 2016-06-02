var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
var PrivateWallet = (function () {
    function PrivateWallet(seed) {
        var mnemonic = new Mnemonic(seed);
        this.masterPrivKey = mnemonic.toHDPrivateKey();
        this.accountPrivKey = this.masterPrivKey.derive("m/44'/0'/0'");
    }
    return PrivateWallet;
})();
exports.PrivateWallet = PrivateWallet;
//# sourceMappingURL=PrivateWallet.js.map