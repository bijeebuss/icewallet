import {Wallet} from "../src/wallet";

var wallet = new Wallet('scheme caution cabin snack squeeze busy lava duck bleak cement medal endless');
console.log(wallet.getAddress(0).toString())
wallet.getBalance()
console.log(wallet.accountPrivKey)
