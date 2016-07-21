export class WalletInfo {
  accounts:Account[]
  constructor(){
    this.accounts = [];
  }
}

export class Account {
  name:string
  xpub:string
  nextChangeIndex:number
  nextExternalIndex:number
  hdPublicKey:any;  
}




