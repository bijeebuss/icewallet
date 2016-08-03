var bitcore = require('bitcore-lib');
import {autoserializeAs} from 'cerialize';
import {Account} from './Account'

export class PublicWalletInfo {
  
  @autoserializeAs(Account) 
  public accounts:Account[] = []

  // overriden for PrivateWalletInfo
  public addAccount(xpub:string, name:string){
    // Must use actual contructor for serializeAs to work properly 
    var account = new Account();
    account.xpub = xpub;
    account.name = name;
    account.hdPublicKey = new bitcore.HDPublicKey(xpub);
    this.accounts.push(account);
  }
}




