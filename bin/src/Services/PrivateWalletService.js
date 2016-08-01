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
        return this.walletHdPrivKey.derive("m/44'/0'").derive(this.selectedAccount.index, true);
    }
    get nextChangeIndex() {
        return this.selectedAccount.nextChangeIndex;
    }
    set nextChangeIndex(value) {
        this.selectedAccount.nextChangeIndex = value;
    }
    get nextExternalIndex() {
        return this.selectedAccount.nextExternalIndex;
    }
    set nextExternalIndex(value) {
        this.selectedAccount.nextExternalIndex = value;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvU2VydmljZXMvUHJpdmF0ZVdhbGxldFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUMzQyw0QkFBcUMsV0FDckMsQ0FBQyxDQUQrQztBQUNoRCxvQ0FBZ0MsNkJBQ2hDLENBQUMsQ0FENEQ7QUFDN0Qsa0NBQTRCLDJCQUM1QixDQUFDLENBRHNEO0FBQ3ZELGdDQUEwQixpQkFDMUIsQ0FBQyxDQUQwQztBQUMzQyxNQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQztBQUVoQyxtQ0FBa0QsdUJBQWE7SUEyRDdELFlBQVksVUFBNEIsRUFBRSxRQUFlO1FBQ3ZELEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7WUFDcEIsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlDLENBQUM7UUFDRCxJQUFJLGVBQWUsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZFLE1BQU0sVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQ3pDLENBQUM7SUE5REQsSUFBSSxnQkFBZ0I7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRUQsSUFBSSxlQUFl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