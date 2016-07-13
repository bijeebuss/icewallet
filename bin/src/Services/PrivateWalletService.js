"use strict";
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
const WalletInfo_1 = require('../Models/WalletInfo');
const TransactionInfo_1 = require('../Models/TransactionInfo');
const WalletService_1 = require('./WalletService');
const async = require('async');
class PrivateWalletService extends WalletService_1.default {
    constructor(walletInfo, password) {
        if (!walletInfo.seed) {
            walletInfo.seed = new Mnemonic().toString();
        }
        let walletHdPrivKey = (new Mnemonic(walletInfo.seed)).toHDPrivateKey();
        let accountHdPrivKey = walletHdPrivKey.derive("m/44'/0'/0'");
        super(accountHdPrivKey.hdPublicKey.toString(), password);
        this.walletHdPrivKey = walletHdPrivKey;
        this.accountHdPrivKey = accountHdPrivKey;
        this.walletInfo = walletInfo;
    }
    static openWallet(password, encryptedInfo, callback) {
        this.cryptoService.decrypt(password, encryptedInfo, (err, decrypted) => {
            if (err) {
                return callback(err, null, null);
            }
            try {
                var walletInfo = JSON.parse(decrypted);
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
        return this.address(this.walletInfo.nextUnusedAddresses.external, false);
    }
    incrementChangeIndex() {
        this.walletInfo.nextUnusedAddresses.change += 1;
    }
    incrementExternalIndex() {
        this.walletInfo.nextUnusedAddresses.external += 1;
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
            var exportInfo = new WalletInfo_1.WalletInfo();
            exportInfo.exportSeed = this.walletInfo.exportSeed;
            exportInfo.seedHash = this.walletInfo.seedHash;
            exportInfo.seed = this.walletInfo.exportSeed ? this.walletInfo.seed : null;
            exportInfo.nextUnusedAddresses.change = this.walletInfo.nextUnusedAddresses.change;
            exportInfo.nextUnusedAddresses.external = this.walletInfo.nextUnusedAddresses.external;
            let encrypted = PrivateWalletService.cryptoService.encrypt(results['cryptoKey'], JSON.stringify(exportInfo));
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
        var indexes = this.walletInfo.nextUnusedAddresses;
        var changePrivateKeys = this.privateKeyRange(0, indexes.change - 1, true);
        var externalPrivateKeys = this.privateKeyRange(0, indexes.external - 1, false);
        transaction
            .change(this.address(indexes.change, true))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvU2VydmljZXMvUHJpdmF0ZVdhbGxldFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUczQyw2QkFBeUIsc0JBQ3pCLENBQUMsQ0FEOEM7QUFDL0Msa0NBQTRCLDJCQUM1QixDQUFDLENBRHNEO0FBQ3ZELGdDQUEwQixpQkFDMUIsQ0FBQyxDQUQwQztBQUMzQyxNQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQztBQUVoQyxtQ0FBa0QsdUJBQWE7SUF5QzdELFlBQVksVUFBcUIsRUFBRSxRQUFlO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7WUFDcEIsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlDLENBQUM7UUFDRCxJQUFJLGVBQWUsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZFLElBQUksZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3RCxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDL0IsQ0FBQztJQTlDRCxPQUFPLFVBQVUsQ0FBQyxRQUFlLEVBQUUsYUFBb0IsRUFBRSxRQUFvRTtRQUMzSCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLFNBQVM7WUFDakUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztnQkFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUNELElBQUksQ0FBQztnQkFDSCxJQUFJLFVBQVUsR0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BELENBQ0E7WUFBQSxLQUFLLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNULE1BQU0sQ0FBQyxRQUFRLENBQUMsd0RBQXdELEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3JGLENBQUM7WUFDRCxFQUFFLENBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFBLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwRCxDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxNQUFNLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzVELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM1QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsT0FBTyxVQUFVLENBQUMsUUFBZSxFQUFFLElBQWUsRUFBRSxJQUFXLEVBQUUsUUFBa0Q7UUFDakgsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTztZQUM5RCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBO1lBQzdCLENBQUM7WUFDRCxFQUFFLENBQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxNQUFNLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBY0QsWUFBWSxDQUFDLEtBQVksRUFBRSxNQUFjO1FBQ3ZDLElBQUksS0FBSyxHQUFVLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsZUFBZSxDQUFDLEtBQVksRUFBRSxHQUFVLEVBQUUsTUFBYztRQUN0RCxJQUFJLElBQUksR0FBWSxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVUsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGlCQUFpQjtRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCxvQkFBb0I7UUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxzQkFBc0I7UUFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxVQUFVLENBQUMsUUFBNEM7UUFFckQsS0FBSyxDQUFDLFFBQVEsQ0FBUztZQUVyQixTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssb0JBQW9CLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztZQUVsRixRQUFRLEVBQUUsQ0FBQyxFQUFFO2dCQUNYLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FBQztvQkFDekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDakIsQ0FBQztnQkFDRCxJQUFJLENBQUEsQ0FBQztvQkFDSCxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUk7d0JBQ3RFLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7NEJBQ04sTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDakIsQ0FBQzt3QkFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7d0JBQ2hDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUN4QixDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO1lBQ0gsQ0FBQztTQUNGLEVBQ0QsQ0FBQyxHQUFHLEVBQUMsT0FBTztZQUNWLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ04sTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUVELElBQUksVUFBVSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1lBQ2xDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7WUFDbkQsVUFBVSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztZQUMvQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUMzRSxVQUFVLENBQUMsbUJBQW1CLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDO1lBQ25GLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUM7WUFFdkYsSUFBSSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzdHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRW5DLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGdCQUFnQixDQUFDLHFCQUE0QjtRQUMzQyxJQUFJLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7UUFDN0UsSUFBSSxJQUFJLEdBQUcsSUFBSSx5QkFBZSxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdkIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNO1lBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDOUUsQ0FBQyxDQUFDLENBQUE7UUFDRixNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELG1CQUFtQixDQUFDLHFCQUE0QixFQUFFLEdBQUc7UUFDbkQsSUFBSSxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1FBQzdFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUM7UUFDbEQsSUFBSSxpQkFBaUIsR0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5RSxJQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRS9FLFdBQVc7YUFDUixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7YUFDUixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUV2RCxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQSxDQUFDO1lBQ2hDLE1BQU0sMkVBQTJFLENBQUM7UUFDcEYsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7QUFDSCxDQUFDO0FBakpEO3NDQWlKQyxDQUFBIn0=