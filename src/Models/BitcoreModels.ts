

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

    export interface ScriptSig {
        asm: string;
        hex: string;
    }

    export interface Vin {
        txid: string;
        vout: number;
        scriptSig: ScriptSig;
        sequence: number;
        n: number;
        addr: string;
        valueSat: number;
        value: number;
        doubleSpentTxID?: any;
    }

    export interface ScriptPubKey {
        hex: string;
        asm: string;
        addresses: string[];
        type: string;
    }

    export interface Vout {
        value: string;
        n: number;
        scriptPubKey: ScriptPubKey;
        spentTxId?: any;
        spentIndex?: any;
        spentHeight?: any;
    }

    export interface Transaction {
        txid: string;
        version: number;
        locktime: number;
        vin: Vin[];
        vout: Vout[];
        blockhash: string;
        blockheight: number;
        confirmations: number;
        time: number;
        blocktime: number;
        valueOut: number;
        size: number;
        valueIn: number;
        fees: number;
    }

    export interface AddressInfo {
        addrStr: string;
        balance: number;
        balanceSat: number;
        totalReceived: number;
        totalReceivedSat: number;
        totalSent: number;
        totalSentSat: number;
        unconfirmedBalance: number;
        unconfirmedBalanceSat: number;
        unconfirmedTxApperances: number;
        txApperances: number;
        transactions: string[];
    }
