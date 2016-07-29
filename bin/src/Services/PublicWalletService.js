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
        this.transactions = [];
        this.changeAddresses = [];
        this.externalAddresses = [];
        this.lastUpdated = new Date();
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
    getTransactions(change, callback) {
        var startingAddress = 0;
        var addrs = this.addressRange(startingAddress, startingAddress + 19, change);
        var self = this;
        function combine(err, resp, body) {
            if (err) {
                return callback(err, null);
            }
            var transactions = JSON.parse(body).items;
            if (transactions.length > 0) {
                transactions.forEach((utxo) => self.transactions.push(utxo));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TZXJ2aWNlcy9QdWJsaWNXYWxsZXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsTUFBTyxLQUFLLFdBQVcsT0FBTyxDQUFDLENBQUM7QUFDaEMsaUNBQTZCLDRCQUE0QixDQUFDLENBQUE7QUFDMUQsbUNBQStCLDRCQUMvQixDQUFDLENBRDBEO0FBRTNELGdDQUEwQixpQkFBaUIsQ0FBQyxDQUFBO0FBQzVDLDRCQUFxQyxXQUVyQyxDQUFDLENBRitDO0FBRWhELGtDQUFrQyx1QkFBYTtJQU83QyxZQUFZLElBQXNCLEVBQUUsUUFBZTtRQUVqRCxNQUFNLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksK0JBQWMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxlQUFlLEdBQUUsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxPQUFPLFVBQVUsQ0FBQyxRQUFlLEVBQUUsYUFBb0IsRUFBRSxRQUFtRTtRQUMxSCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLFNBQVM7WUFDakUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztnQkFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUNELElBQUks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