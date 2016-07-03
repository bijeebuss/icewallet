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
var PublicWalletService = (function (_super) {
    __extends(PublicWalletService, _super);
    function PublicWalletService() {
        _super.apply(this, arguments);
        this.insightService = new InsightService_1.InsightService('https://insight.bitpay.com/api/');
        this.transactionExportPath = './data/initialTransaction.dat';
        this.transactionImportPath = './data/signedTransaction.dat';
        this.transactions = [];
        this.changeAddresses = [];
        this.externalAddresses = [];
        this.lastUpdated = new Date();
    }
    Object.defineProperty(PublicWalletService.prototype, "balance", {
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
    PublicWalletService.prototype.getAddressInfo = function (index, change, callback) {
        var address = this.address(index, change);
        this.insightService.getAddressInfo(address, function (err, resp, body) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, JSON.parse(body));
        });
    };
    PublicWalletService.prototype.getTransactions = function (change, callback) {
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
    PublicWalletService.prototype.getAddresses = function (change, callback) {
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
    PublicWalletService.prototype.update = function (callback) {
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
    PublicWalletService.prototype.createTransaction = function (to, amount, callback) {
        var addrs = [];
        var total = 0;
        var standardFee = 15000;
        var addrsWithBalance = this.externalAddresses.concat(this.changeAddresses)
            .filter(function (addr) { return addr.balanceSat > 0; });
        addrsWithBalance.forEach(function (addr) {
            if (total < amount + standardFee) {
                addrs.push(addr.addrStr);
                total += addr.balanceSat;
            }
        });
        if (total < amount + standardFee) {
            return callback('you dont have enough coins for this transaction plus a fee', null);
        }
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
    PublicWalletService.prototype.initiateTransaction = function (to, amount, callback) {
        var _this = this;
        this.createTransaction(to, amount, function (err, transaction) {
            if (err) {
                return callback(err, null);
            }
            fs.writeFile(_this.transactionExportPath, JSON.stringify(transaction.toObject()), function (err) {
                if (err) {
                    return callback(err, transaction);
                }
                console.log('transaction written to ' + _this.transactionExportPath);
                console.log('sign the transaction offline then complete it');
                return callback(null, transaction);
            });
        });
    };
    PublicWalletService.prototype.broadcastTransaction = function (callback) {
        var _this = this;
        fs.readFile(this.transactionImportPath, 'utf8', function (err, data) {
            if (err) {
                return callback(err, null);
            }
            var transaction = new bitcore.Transaction(JSON.parse(data));
            _this.insightService.broadcastTransaction(transaction.serialize(), callback);
        });
    };
    return PublicWalletService;
}(WalletBase_1.default));
exports.PublicWalletService = PublicWalletService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZGVscy9QdWJsaWNXYWxsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQU8sS0FBSyxXQUFXLE9BQU8sQ0FBQyxDQUFDO0FBQ2hDLCtCQUE2Qiw0QkFDN0IsQ0FBQyxDQUR3RDtBQUV6RCwyQkFBdUIsY0FDdkIsQ0FBQyxDQURvQztBQUNyQyxJQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUUxQjtJQUFrQyx1Q0FBVTtJQUE1QztRQUFrQyw4QkFBVTtRQUMxQyxtQkFBYyxHQUFrQixJQUFJLCtCQUFjLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUN0RiwwQkFBcUIsR0FBVSwrQkFBK0IsQ0FBQTtRQUM5RCwwQkFBcUIsR0FBVSw4QkFBOEIsQ0FBQTtRQUU3RCxpQkFBWSxHQUFvQixFQUFFLENBQUM7UUFDbkMsb0JBQWUsR0FBb0IsRUFBRSxDQUFDO1FBQ3RDLHNCQUFpQixHQUFvQixFQUFFLENBQUM7UUFDeEMsZ0JBQVcsR0FBUSxJQUFJLElBQUksRUFBRSxDQUFDO0lBbUxoQyxDQUFDO0lBakxDLHNCQUFXLHdDQUFPO2FBQWxCO1lBQ0UsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztZQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQSxDQUFDO2dCQUNuQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxJQUFJLENBQUMsVUFBVSxFQUFmLENBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLEdBQUcs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