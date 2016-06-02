var PrivateWallet_1 = require("../src/PrivateWallet");
var PublicWallet_1 = require("../src/PublicWallet");
var privateWallet = new PrivateWallet_1.PrivateWallet('scheme caution cabin snack squeeze busy lava duck bleak cement medal endless');
var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString();
console.log(pubKey);
var publicWallet = new PublicWallet_1.PublicWallet(pubKey);
console.log(publicWallet.getAddress(0));
publicWallet.getBalance();
//# sourceMappingURL=walletTest.js.map