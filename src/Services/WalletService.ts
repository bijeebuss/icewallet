var bitcore = require('bitcore-lib');
import CryptoService from '../Services/CryptoService'
import {WalletInfo} from '../Models/WalletInfo'

abstract class WalletService {
  password:string;
  walletInfo:WalletInfo;
  selectedAccountIndex:number;
  static cryptoService = new CryptoService();
  
  get hdPublicKey():any {
      return this.walletInfo.accounts[this.selectedAccountIndex].hdPublicKey;
  }
  
  constructor(info:WalletInfo, password:string){
    this.walletInfo = info;
    this.selectedAccountIndex = 0;
    // need to set these to the info
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