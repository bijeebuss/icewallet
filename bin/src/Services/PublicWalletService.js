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
            else if (decrypted.startsWith('xpub')) {
                let error = 'This version of Icewallet is not compatable with your wallet\n';
                error += 'Please create a new wallet with your public key\n';
                error += decrypted + '\n';
                error += 'Then use the "Next Unused Address Indexes" option to update your private wallet';
                return callback(error, null, null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TZXJ2aWNlcy9QdWJsaWNXYWxsZXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsTUFBTyxLQUFLLFdBQVcsT0FBTyxDQUFDLENBQUM7QUFDaEMsaUNBQTZCLDRCQUE0QixDQUFDLENBQUE7QUFDMUQsbUNBQStCLDRCQUMvQixDQUFDLENBRDBEO0FBRTNELGdDQUEwQixpQkFBaUIsQ0FBQyxDQUFBO0FBQzVDLDRCQUFxQyxXQUVyQyxDQUFDLENBRitDO0FBRWhELGtDQUFrQyx1QkFBYTtJQU03QyxZQUFZLElBQXNCLEVBQUUsUUFBZTtRQUVqRCxNQUFNLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksK0JBQWMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxlQUFlLEdBQUUsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVELE9BQU8sVUFBVSxDQUFDLFFBQWUsRUFBRSxhQUFvQixFQUFFLFFBQW1FO1FBQzFILElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUztZQUNqRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQSxDQUFDO2dCQUNyQyxJQUFJLEtBQUss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