"use strict";
var bitcore = require('bitcore-lib');
var async = require('async');
var InsightService_1 = require("../Services/InsightService");
var PublicWallet = (function () {
    function PublicWallet(publicKey) {
        this.insightService = new InsightService_1.InsightService('https://insight.bitpay.com/api/');
        this.transactions = [];
        this.changeAddresses = [];
        this.externalAddresses = [];
        this.lastUpdated = new Date();
        this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
    }
    Object.defineProperty(PublicWallet.prototype, "balance", {
        get: function () {
            var changeBalance = 0;
            var externalBalance = 0;
            if (this.changeAddresses.length > 0) {
                changeBalance = this.changeAddresses.map(function (addr) { return addr.balanceSat; }).reduce(function (p, c) { return c + p; });
            }
            if (this.externalAddresses.length > 0) {
                externalBalance = this.externalAddresses.map(function (addr) { return addr.balanceSat; }).reduce(function (p, c) { return c + p; });
            }
            return changeBalance + externalBalance;
        },
        enumerable: true,
        configurable: true
    });
    PublicWallet.prototype.getAddress = function (index, change) {
        var chain = change ? 1 : 0;
        return new bitcore.Address(this.hdPublicKey.derive(chain).derive(index).publicKey);
    };
    PublicWallet.prototype.getAddressRange = function (start, end, change) {
        var addresses = [];
        for (var i = start; i <= end; i++) {
            addresses.push(this.getAddress(i, change).toString());
        }
        return addresses;
    };
    PublicWallet.prototype.getAddressInfo = function (index, change, callback) {
        var address = this.getAddress(index, change).toString();
        this.insightService.getAddressInfo(address, function (err, resp, body) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, JSON.parse(body));
        });
    };
    PublicWallet.prototype.getTransactions = function (change, callback) {
        var startingAddress = 0;
        var addrs = this.getAddressRange(startingAddress, startingAddress + 19, change);
        var self = this;
        function combine(err, resp, body) {
            if (err) {
                return callback(err, null);
            }
            var transactions = JSON.parse(body).items;
            if (transactions.length > 0) {
                transactions.forEach(function (utxo) { return self.transactions.push(utxo); });
                startingAddress += 20;
                addrs = self.getAddressRange(startingAddress, startingAddress + 19, change);
                self.insightService.getTransactions(addrs, combine);
            }
            else {
                callback(err, transactions);
            }
        }
        this.insightService.getTransactions(addrs, combine);
    };
    PublicWallet.prototype.getAddresses = function (change, callback) {
        var _this = this;
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
        var q = async.queue(function (task, callback) {
            _this.getAddressInfo(task.index, change, function (err, address) {
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
        q.drain = function () {
            callback(errors.length > 0 ? errors : null, addresses);
        };
    };
    PublicWallet.prototype.update = function (callback) {
        var _this = this;
        async.series([
            function (cb) { return _this.getAddresses(false, cb); },
            function (cb) { return _this.getAddresses(true, cb); },
        ], function (err, results) {
            if (err) {
                return callback(err, null);
            }
            _this.externalAddresses = results[0];
            _this.changeAddresses = results[1];
            callback(null, _this);
        });
    };
    PublicWallet.prototype.createTransaction = function (to, amount, callback) {
        var addrs = [];
        var total = 0;
        this.externalAddresses.filter(function (addr) { return addr.balanceSat > 0; }).forEach(function (addr) {
            if (total < amount) {
                addrs.push(addr.addrStr);
                total += addr.balanceSat;
            }
        });
        this.insightService.getUtxos(addrs, function (err, utxos) {
            if (err) {
                return callback(err, null);
            }
            var utxosForTransaction = utxos.map(function (utxo) {
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
            return callback(null, transaction);
        });
    };
    PublicWallet.prototype.boradcastTransaction = function (transaction, callback) {
        this.insightService.broadcastTransaction(transaction.serialize(), callback);
    };
    return PublicWallet;
}());
exports.PublicWallet = PublicWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZGVscy9QdWJsaWNXYWxsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQyxJQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQztBQUNoQywrQkFBNkIsNEJBQzdCLENBQUMsQ0FEd0Q7QUFHekQ7SUFvQkUsc0JBQVksU0FBaUI7UUFuQjdCLG1CQUFjLEdBQWtCLElBQUksK0JBQWMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBRXRGLGlCQUFZLEdBQW9CLEVBQUUsQ0FBQztRQUNuQyxvQkFBZSxHQUFvQixFQUFFLENBQUM7UUFDdEMsc0JBQWlCLEdBQW9CLEVBQUUsQ0FBQztRQUN4QyxnQkFBVyxHQUFRLElBQUksSUFBSSxFQUFFLENBQUM7UUFlNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQWRELHNCQUFXLGlDQUFPO2FBQWxCO1lBQ0UsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztZQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQSxDQUFDO2dCQUNuQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxJQUFJLENBQUMsVUFBVSxFQUFmLENBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLEdBQUcsQ0FBQyxFQUFMLENBQUssQ0FBQyxDQUFDO1lBQzdGLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMs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