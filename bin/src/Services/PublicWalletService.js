"use strict";
var bitcore = require('bitcore-lib');
const async = require('async');
const InsightService_1 = require('../Services/InsightService');
const WalletService_1 = require('./WalletService');
class PublicWalletService extends WalletService_1.default {
    constructor(publicKey, password) {
        super(publicKey, password);
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
            var wallet = new PublicWalletService(decrypted, password);
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
            let encrypted = PublicWalletService.cryptoService.encrypt(key, this.hdPublicKey.toString());
            return callback(null, encrypted);
        });
    }
}
exports.PublicWalletService = PublicWalletService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TZXJ2aWNlcy9QdWJsaWNXYWxsZXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsTUFBTyxLQUFLLFdBQVcsT0FBTyxDQUFDLENBQUM7QUFDaEMsaUNBQTZCLDRCQUE0QixDQUFDLENBQUE7QUFFMUQsZ0NBQTBCLGlCQUFpQixDQUFDLENBQUE7QUFFNUMsa0NBQWtDLHVCQUFhO0lBTzdDLFlBQVksU0FBaUIsRUFBRSxRQUFlO1FBRTVDLE1BQU0sU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSwrQkFBYyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRSxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELE9BQU8sVUFBVSxDQUFDLFFBQWUsRUFBRSxhQUFvQixFQUFFLFFBQStEO1FBQ3RILElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUztZQUNqRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDMUQsTUFB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