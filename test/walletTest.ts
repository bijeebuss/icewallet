import {PrivateWallet} from "../src/PrivateWallet";
import {PublicWallet} from "../src/PublicWallet";


var privateWallet = new PrivateWallet('scheme caution cabin snack squeeze busy lava duck bleak cement medal endless');

var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString() 
console.log(pubKey);

var publicWallet = new PublicWallet(pubKey)
console.log(publicWallet.getAddress(0));
publicWallet.getBalance();
