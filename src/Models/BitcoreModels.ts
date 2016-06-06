

    export interface Utxo {
        address: string;
        txid: string;
        vout: number;
        scriptPubKey: string;
        amount: number;
        satoshis: number;
        height: number;
        confirmations: number;
    }
