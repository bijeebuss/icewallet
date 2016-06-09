import {PrivateWallet} from "../src/Models/PrivateWallet";
import {PublicWallet} from "../src/Models/PublicWallet";


var privateWallet = new PrivateWallet('scheme caution cabin snack squeeze busy lava duck bleak cement medal endless');

var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString() 
console.log(pubKey);

var publicWallet = new PublicWallet(pubKey)
//console.log(publicWallet.getAddress(0,false));
// publicWallet.getAddressInfo(0,false,
//   (err,info) => console.log(info)
// );

// publicWallet.getUtxos(false,
//   (err,utxos) => {}
// );

// publicWallet.update((err,wallet) => {
//   console.log(wallet.balance);
// })

//publicWallet.getAddresses(false, (err, addressInfo) =>  console.log(addressInfo))
publicWallet.update((err, wallet) => {
  if(err){
    console.log(err);
  }
  wallet.createTransaction('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', 0.005, (err, transaction) =>{
    console.log(transaction)
  })
})