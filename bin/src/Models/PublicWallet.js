"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bitcore = require('bitcore-lib');
var async = require('async');
var InsightService_1 = require("../Services/InsightService");
var WalletBase_1 = require('./WalletBase');
var fs = require('fs');
var PublicWallet = (function (_super) {
    __extends(PublicWallet, _super);
    function PublicWallet() {
        _super.apply(this, arguments);
        this.insightService = new InsightService_1.InsightService('https://insight.bitpay.com/api/');
        this.transactionExportPath = './data/initialTransaction.dat';
        this.transactions = [];
        this.changeAddresses = [];
        this.externalAddresses = [];
        this.lastUpdated = new Date();
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
    PublicWallet.prototype.getAddressInfo = function (index, change, callback) {
        var address = this.address(index, change);
        this.insightService.getAddressInfo(address, function (err, resp, body) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, JSON.parse(body));
        });
    };
    PublicWallet.prototype.getTransactions = function (change, callback) {
        var startingAddress = 0;
        var addrs = this.addressRange(startingAddress, startingAddress + 19, change);
        var self = this;
        function combine(err, resp, body) {
            if (err) {
                return callback(err, null);
            }
            var transactions = JSON.parse(body).items;
            if (transactions.length > 0) {
                transactions.forEach(function (utxo) { return self.transactions.push(utxo); });
                startingAddress += 20;
                addrs = self.addressRange(startingAddress, startingAddress + 19, change);
                self.insightService.getTransactions(addrs, combine);
            }
            else {
                return callback(err, transactions);
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
            return callback(errors.length > 0 ? errors : null, addresses);
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
            return callback(null, _this);
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
    PublicWallet.prototype.initiateTransaction = function (to, amount, callback) {
        var _this = this;
        this.createTransaction(to, amount, function (err, transaction) {
            if (err) {
                return callback(err, null);
            }
            fs.writeFile(_this.transactionExportPath, transaction.uncheckedSerialize(), function (err) {
                if (err) {
                    return callback(err, transaction);
                }
                console.log('transaction written to ' + _this.transactionExportPath);
                console.log('sign the transaction offline then complete it');
                return callback(null, transaction);
            });
        });
    };
    PublicWallet.prototype.broadcastTransaction = function (transaction, callback) {
        this.insightService.broadcastTransaction(transaction.serialize(), callback);
    };
    return PublicWallet;
}(WalletBase_1.default));
exports.PublicWallet = PublicWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZGVscy9QdWJsaWNXYWxsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQU8sS0FBSyxXQUFXLE9BQU8sQ0FBQyxDQUFDO0FBQ2hDLCtCQUE2Qiw0QkFDN0IsQ0FBQyxDQUR3RDtBQUV6RCwyQkFBdUIsY0FDdkIsQ0FBQyxDQURvQztBQUNyQyxJQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUUxQjtJQUEyQixnQ0FBVTtJQUFyQztRQUEyQiw4QkFBVTtRQUNuQyxtQkFBYyxHQUFrQixJQUFJLCtCQUFjLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUN0RiwwQkFBcUIsR0FBVSwrQkFBK0IsQ0FBQTtRQUU5RCxpQkFBWSxHQUFvQixFQUFFLENBQUM7UUFDbkMsb0JBQWUsR0FBb0IsRUFBRSxDQUFDO1FBQ3RDLHNCQUFpQixHQUFvQixFQUFFLENBQUM7UUFDeEMsZ0JBQVcsR0FBUSxJQUFJLElBQUksRUFBRSxDQUFDO0lBOEtoQyxDQUFDO0lBNUtDLHNCQUFXLGlDQUFPO2FBQWxCO1lBQ0UsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztZQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQSxDQUFDO2dCQUNuQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxJQUFJLENBQUMsVUFBVSxFQUFmLENBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLEdBQUcsQ0FBQyxFQUFMLENBQUssQ0FBQyxDQUFDO1lBQzdG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