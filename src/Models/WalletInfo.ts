export class WalletInfo {
  seed:string
  exportSeed:boolean
  nextUnusedAddresses:AddressIndexes

  constructor(){
    this.nextUnusedAddresses = new AddressIndexes();
  }
}

export class AddressIndexes {
  change: number
  external: number
}



