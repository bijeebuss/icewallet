"use strict";
var bitcore = require('bitcore-lib');
const async = require('async');
const InsightService_1 = require('../Services/InsightService');
const PublicWalletInfo_1 = require('../Models/PublicWalletInfo');
const WalletService_1 = require('./WalletService');
const cerialize_1 = require('cerialize');
class PublicWalletService extends WalletService_1.default {
    constructor(info, password) {
        super(info, password);
        this.insightService = new InsightService_1.InsightService('https://insight.bitpay.com/api/');
        this.changeAddresses = [];
        this.externalAddresses = [];
    }
    static openWallet(password, encryptedInfo, callback) {
        this.cryptoService.decrypt(password, encryptedInfo, (err, decrypted) => {
            if (err) {
                return callback(err, null, null);
            }
            try {
                var json = JSON.parse(decrypted);
                var walletInfo = cerialize_1.Deserialize(json, PublicWalletInfo_1.PublicWalletInfo);
                var wallet = new PublicWalletService(walletInfo, password);
            }
            catch (err) {
                return callback('Could not create wallet, check your xpub or password', decrypted, null);
            }
            return callback(null, decrypted, wallet);
        });
    }
    get balance() {
        var changeBalance = 0;
        var externalBalance = 0;
        if (this.changeAddresses.length > 0) {
            changeBalance = this.changeAddresses.map((addr) => addr.balanceSat).reduce((p, c) => c + p);
        }
        if (this.externalAddresses.length > 0) {
            externalBalance = this.externalAddresses.map((addr) => addr.balanceSat).reduce((p, c) => c + p);
        }
        return changeBalance + externalBalance;
    }
    getAddressInfo(index, change, callback) {
        var address = this.address(index, change);
        this.insightService.getAddressInfo(address, (err, resp, body) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, JSON.parse(body));
        });
    }
    switchAccount(accountName, callback) {
        this.selectedAccount = this.walletInfo.accounts.find(account => account.name == accountName);
        console.log('updating wallet account...');
        return this.update(callback);
    }
    getTransactions(change, callback) {
        var startingAddress = 0;
        var addrs = this.addressRange(startingAddress, startingAddress + 19, change);
        var transactions = [];
        var self = this;
        function combine(err, resp, body) {
            if (err) {
                return callback(err, null);
            }
            var transactionBatch = JSON.parse(body).items;
            transactionBatch.forEach((utxo) => transactions.push(utxo));
            if (transactionBatch.length > 0) {
                startingAddress += 20;
                addrs = self.addressRange(startingAddress, startingAddress + 19, change);
                self.insightService.getTransactions(addrs, combine);
            }
            else {
                return callback(err, transactions);
            }
        }
        this.insightService.getTransactions(addrs, combine);
    }
    getAddresses(change, callback) {
        var maxConcurrency = 3;
        var maxUnusedAddresses = 5;
        var index = 0;
        var emptyAddressCount = 0;
        var addresses = [];
        var errors = [];
        function taskCallback(error) {
            if (error) {
                return errors.push(error);
            }
        }
        var q = async.queue((task, callback) => {
            this.getAddressInfo(task.index, change, (err, address) => {
                if (err) {
                    return callback(err);
                }
                if (address.txApperances == 0) {
                    emptyAddressCount++;
                }
                else {
                    addresses[task.index] = address;
                }
                if (emptyAddressCount < maxUnusedAddresses) {
                    q.push({ index: index }, taskCallback);
                }
                index++;
                return callback();
            });
        }, maxConcurrency);
        for (index = 0; index < maxConcurrency; index++) {
            q.push({ index: index }, taskCallback);
        }
        q.drain = () => {
            return callback(errors.length > 0 ? errors : null, addresses);
        };
    }
    update(callback) {
        async.series([
                (cb) => this.getAddresses(false, cb),
                (cb) => this.getAddresses(true, cb),
        ], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            this.externalAddresses = results[0];
            this.changeAddresses = results[1];
            return callback(null, this);
        });
    }
    createTransaction(to, amount, callback) {
        var addrs = [];
        var total = 0;
        var standardFee = 15000;
        var addrsWithBalance = this.externalAddresses.concat(this.changeAddresses)
            .filter((addr) => addr.balanceSat > 0);
        addrsWithBalance.forEach((addr) => {
            if (total < amount + standardFee) {
                addrs.push(addr.addrStr);
                total += addr.balanceSat;
            }
        });
        if (total < amount + standardFee) {
            return callback('you dont have enough coins for this transaction plus a fee', null);
        }
        this.insightService.getUtxos(addrs, (err, utxos) => {
            if (err) {
                return callback(err, null);
            }
            var utxosForTransaction = utxos.map((utxo) => {
                return {
                    address: utxo.address,
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    script: utxo.scriptPubKey,
                    satoshis: utxo.satoshis
                };
            });
            var transaction = new bitcore.Transaction()
                .from(utxosForTransaction)
                .to(to, amount);
            return callback(null, JSON.stringify(transaction.toObject()));
        });
    }
    broadcastTransaction(serializedTransaction, callback) {
        var transaction = new bitcore.Transaction(JSON.parse(serializedTransaction));
        this.insightService.broadcastTransaction(transaction.serialize(), callback);
    }
    exportInfo(callback) {
        PublicWalletService.cryptoService.deriveKey(this.password, (err, key) => {
            if (err) {
                return callback(err, null);
            }
            var serialized = cerialize_1.Serialize(this.walletInfo);
            var stringified = JSON.stringify(serialized);
            let encrypted = PublicWalletService.cryptoService.encrypt(key, stringified);
            return callback(null, encrypted);
        });
    }
}
exports.PublicWalletService = PublicWalletService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TZXJ2aWNlcy9QdWJsaWNXYWxsZXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsTUFBTyxLQUFLLFdBQVcsT0FBTyxDQUFDLENBQUM7QUFDaEMsaUNBQTZCLDRCQUE0QixDQUFDLENBQUE7QUFDMUQsbUNBQStCLDRCQUMvQixDQUFDLENBRDBEO0FBRTNELGdDQUEwQixpQkFBaUIsQ0FBQyxDQUFBO0FBQzVDLDRCQUFxQyxXQUVyQyxDQUFDLENBRitDO0FBRWhELGtDQUFrQyx1QkFBYTtJQU03QyxZQUFZLElBQXNCLEVBQUUsUUFBZTtRQUVqRCxNQUFNLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksK0JBQWMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxlQUFlLEdBQUUsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVELE9BQU8sVUFBVSxDQUFDLFFBQWUsRUFBRSxhQUFvQixFQUFFLFFBQW1FO1FBQzFILElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUztZQUNqRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsSUFBSSxDQUFDO2dCQUNILElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksVUFBVSxHQUFv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