import {PrivateWallet} from "../src/Models/PrivateWallet";
import {PublicWallet} from "../src/Models/PublicWallet";


var privateWallet = new PrivateWallet('scheme caution cabin snack squeeze busy lava duck bleak cement medal endless');

var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString() 
console.log(pubKey);

var publicWallet = new PublicWallet(pubKey)
console.log(publicWallet.getAddress(0,false));
publicWallet.getAddressBalance(0,false,
  (err,resp,body) => console.log(body)
);

publicWallet.getWalletBalance(
  (err,resp,body) => console.log(body)
);
