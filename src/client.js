var fs = require('fs');
var HDPrivateKey_1 = require('./HDPrivateKey');
var BWS_INSTANCE_URL = 'https://bws.bitpay.com/bws/api';
var client = new Client({
    baseUrl: BWS_INSTANCE_URL,
    verbose: false,
});
debugger;
var opts = {};
client.seedFromExtendedPublicKey(HDPrivateKey_1.accountKey.hdPublicKey.toString(), 'other', HDPrivateKey_1.entropySource, opts);
client.createWallet('MichaelsWallet', 'Michael', 1, 1, {}, function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('wallet created');
    fs.writeFileSync('Michael.dat', client.export());
});
//# sourceMappingURL=client.js.map