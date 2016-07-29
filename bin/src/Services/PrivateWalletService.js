"use strict";
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
const cerialize_1 = require('cerialize');
const PrivateWalletInfo_1 = require('../Models/PrivateWalletInfo');
const TransactionInfo_1 = require('../Models/TransactionInfo');
const WalletService_1 = require('./WalletService');
const async = require('async');
class PrivateWalletService extends WalletService_1.default {
    constructor(walletInfo, password) {
        if (!walletInfo.seed) {
            walletInfo.seed = new Mnemonic().toString();
        }
        let walletHdPrivKey = (new Mnemonic(walletInfo.seed)).toHDPrivateKey();
        super(walletInfo, password);
        this.walletHdPrivKey = walletHdPrivKey;
    }
    get accountHdPrivKey() {
        return this.walletHdPrivKey.derive("m/44'/0'").derive(this.selectedAccountIndex, true);
    }
    get nextChangeIndex() {
        return this.walletInfo.accounts[this.selectedAccountIndex].nextChangeIndex;
    }
    set nextChangeIndex(value) {
        this.walletInfo.accounts[this.selectedAccountIndex].nextChangeIndex = value;
    }
    get nextExternalIndex() {
        return this.walletInfo.accounts[this.selectedAccountIndex].nextExternalIndex;
    }
    set nextExternalIndex(value) {
        this.walletInfo.accounts[this.selectedAccountIndex].nextExternalIndex = value;
    }
    static openWallet(password, encryptedInfo, callback) {
        this.cryptoService.decrypt(password, encryptedInfo, (err, decrypted) => {
            if (err) {
                return callback(err, null, null);
            }
            try {
                var json = JSON.parse(decrypted);
                var walletInfo = cerialize_1.Deserialize(json, PrivateWalletInfo_1.PrivateWalletInfo);
            }
            catch (err) {
                return callback('cannot open wallet, make sure your password is correct', null, null);
            }
            if (walletInfo.seed == null) {
                return callback('SEED_MISSING', walletInfo, null);
            }
            else {
                var wallet = new PrivateWalletService(walletInfo, password);
                return callback(null, walletInfo, wallet);
            }
        });
    }
    static seedWallet(password, info, seed, callback) {
        this.cryptoService.verifyHash(info.seedHash, seed, (err, matched) => {
            if (err) {
                return callback(err, null);
            }
            if (!matched) {
                return callback('seed entered does not match hash', null);
            }
            info.seed = seed;
            var wallet = new PrivateWalletService(info, password);
            return callback(null, wallet);
        });
    }
    hdPrivateKey(index, change) {
        var chain = change ? 1 : 0;
        return this.accountHdPrivKey.derive(chain).derive(index);
    }
    privateKeyRange(start, end, change) {
        var keys = [];
        for (var i = start; i <= end; i++) {
            keys.push(this.hdPrivateKey(i, change).privateKey.toString());
        }
        return keys;
    }
    getDepositAddress() {
        return this.address(this.nextExternalIndex, false);
    }
    incrementChangeIndex() {
        this.nextChangeIndex += 1;
    }
    incrementExternalIndex() {
        this.nextExternalIndex += 1;
    }
    exportInfo(callback) {
        async.parallel({
            cryptoKey: (cb) => PrivateWalletService.cryptoService.deriveKey(this.password, cb),
            seedHash: (cb) => {
                if (this.walletInfo.seedHash || this.walletInfo.exportSeed) {
                    return cb(null);
                }
                else {
                    PrivateWalletService.cryptoService.hash(this.walletInfo.seed, (err, hash) => {
                        if (err) {
                            return cb(err);
                        }
                        this.walletInfo.seedHash = hash;
                        return cb(null, hash);
                    });
                }
            }
        }, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            var serialized = cerialize_1.Serialize(this.walletInfo);
            var stringified = JSON.stringify(serialized);
            let encrypted = PrivateWalletService.cryptoService.encrypt(results['cryptoKey'], stringified);
            return callback(null, encrypted);
        });
    }
    parseTransaction(serializedTransaction) {
        var transaction = new bitcore.Transaction(JSON.parse(serializedTransaction));
        var info = new TransactionInfo_1.default();
        info.outputTotals = {};
        transaction.outputs.forEach((output) => {
            info.outputTotals[output._script.toAddress().toString()] = output._satoshis;
        });
        return info;
    }
    completeTransaction(serializedTransaction, fee) {
        var transaction = new bitcore.Transaction(JSON.parse(serializedTransaction));
        var changePrivateKeys = this.privateKeyRange(0, this.nextChangeIndex - 1, true);
        var externalPrivateKeys = this.privateKeyRange(0, this.nextExternalIndex - 1, false);
        transaction
            .change(this.address(this.nextChangeIndex, true))
            .fee(fee)
            .sign(externalPrivateKeys.concat(changePrivateKeys));
        transaction.serialize();
        if (!transaction.isFullySigned()) {
            throw 'transaction is not fully signed, check yourself before you wreck yourself';
        }
        return JSON.stringify(transaction.toObject());
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PrivateWalletService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvU2VydmljZXMvUHJpdmF0ZVdhbGxldFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUMzQyw0QkFBcUMsV0FDckMsQ0FBQyxDQUQrQztBQUNoRCxvQ0FBZ0MsNkJBQ2hDLENBQUMsQ0FENEQ7QUFDN0Qsa0NBQTRCLDJCQUM1QixDQUFDLENBRHNEO0FBQ3ZELGdDQUEwQixpQkFDMUIsQ0FBQyxDQUQwQztBQUMzQyxNQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQztBQUVoQyxtQ0FBa0QsdUJBQWE7SUEyRDdELFlBQVksVUFBNEIsRUFBRSxRQUFlO1FBQ3ZELEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7WUFDcEIsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlDLENBQUM7UUFDRCxJQUFJLGVBQWUsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZFLE1BQU0sVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQ3pDLENBQUM7SUE5REQsSUFBSSxnQkFBZ0I7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUVELElBQUksZUFBZTtRQUNmLE1B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