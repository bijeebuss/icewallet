export default class TransactionInfo {
  feeBTC:number;
  outputsBTC:Outputs;
}

interface Outputs {
    [address: string]: number;
}