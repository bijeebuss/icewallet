import {WalletInfo} from './WalletInfo'

export class PrivateWalletInfo extends WalletInfo {
  seed:string
  exportSeed:boolean
  seedHash:string
}