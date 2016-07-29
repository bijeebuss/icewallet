var bitcore = require('bitcore-lib');
import CryptoService from '../Services/CryptoService'
import {PublicWalletInfo} from '../Models/PublicWalletInfo'
import {PrivateWalletInfo} from '../Models/PrivateWalletInfo'

abstract class WalletService {
  password:string;
  walletInfo:PublicWalletInfo | PrivateWalletInfo;
  selectedAccountIndex:number;
  static cryptoService = new CryptoService();
  
  get hdPublicKey():any {
      return this.walletInfo.accounts[this.selectedAccountIndex].hdPublicKey;
  }
  
  constructor(info:PublicWalletInfo | PrivateWalletInfo, password:string){
    this.walletInfo = info;
    this.selectedAccountIndex = 0;
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

  abstract exportInfo(callback:(err:any, encryptedInfo:string) => void):void;
}

export default WalletService;