export default class TransactionInfo {
  fee:number;
  outputTotals:Outputs;
}

interface Outputs {
    [address: string]: number;
}