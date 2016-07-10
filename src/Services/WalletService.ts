var bitcore = require('bitcore-lib');
import CryptoService from '../Services/CryptoService'

abstract class WalletService {
  hdPublicKey:any;
  password:string;
  static cryptoService = new CryptoService();
  
  constructor(publicKey: string, password:string){
    this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
    this.password = password;
  }
  
  // returns an address of the given index
  address(index:number, change:boolean):string{
    var chain:number = change ? 1 : 0;
    return new bitcore.Address(this.hdPublicKey.derive(chain).derive(index).publicKey).toString();
  }

  addressRange(start:number, end:number, change:boolean):string[]{
    var addresses:string[] = [];
    for (var i:number = start; i <= end; i++){
      addresses.push(this.address(i,change));
    }
    return addresses;
  }

  abstract exportInfo(callback:(err, encryptedInfo:string) => void);
}

export default WalletService;