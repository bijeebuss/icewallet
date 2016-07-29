import { autoserialize } from 'cerialize';
var bitcore = require('bitcore-lib');

export class Account {
  // not to be serialized
  hdPublicKey:any;

  @autoserialize public xpub:string;
  @autoserialize public name:string;
  @autoserialize public index:number;
  @autoserialize public nextChangeIndex:number;
  @autoserialize public nextExternalIndex:number;

  public static OnDeserialized(instance : Account, json : any) : void {
    instance.hdPublicKey = new bitcore.HDPublicKey(instance.xpub);
  }
}