var bitcore = require('bitcore-lib');
function CreateBrainWallet(phrase) {
    var value = new Buffer(phrase);
    for (var i = 0; i < 100000; i++) {
        value = bitcore.crypto.Hash.sha256(value);
    }
    var bn = bitcore.crypto.BN.fromBuffer(value);
    return new bitcore.PrivateKey(bn);
}
exports.CreateBrainWallet = CreateBrainWallet;
//# sourceMappingURL=brainWallet.js.map