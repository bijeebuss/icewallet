import { autoserialize, autoserializeAs, deserialize } from 'cerialize';
import {Account} from './Account'
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');

export class PrivateWalletInfo{
  // whether to export is determined OnSerialized
  @deserialize public seed:string

  @autoserialize public exportSeed:boolean
  @autoserialize public seedHash:string
  @autoserializeAs(Account) public accounts:Array<Account>

  constructor (seed:string, exportSeed:boolean){
    this.seed = seed;
    this.exportSeed = exportSeed;
    this.accounts = [];
  }

  public addAccount(name:string, index:number, nextChangeIndex:number, nextExternalIndex:number){
    var hdPublicKey = (new Mnemonic(this.seed)).toHDPrivateKey().derive("m/44'/0'").derive(index,true).hdPublicKey
    var account = new Account();
    account.xpub = hdPublicKey.toString(),
    account.name = name,
    account.index = index,
    account.nextChangeIndex = nextChangeIndex,
    account.nextExternalIndex = nextExternalIndex,
    account.hdPublicKey = hdPublicKey,
    this.accounts.push(account);
  }


  public static OnSerialized(instance : PrivateWalletInfo, json : any) : void {
    json['seed'] = instance.exportSeed ? instance.seed : null;
  }
}