"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bitcore = require('bitcore-lib');
var async = require('async');
var InsightService_1 = require("../Services/InsightService");
var WalletService_1 = require('./WalletService');
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
}(WalletService_1.default));
exports.PublicWalletService = PublicWalletService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TZXJ2aWNlcy9QdWJsaWNXYWxsZXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQyxJQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQztBQUNoQywrQkFBNkIsNEJBQzdCLENBQUMsQ0FEd0Q7QUFFekQsOEJBQTBCLGlCQUMxQixDQUFDLENBRDBDO0FBQzNDLElBQU8sRUFBRSxXQUFXLElBQUksQ0FBQyxDQUFDO0FBRTFCO0lBQWtDLHVDQUFhO0lBQS9DO1FBQWtDLDhCQUFhO1FBQzdDLG1CQUFjLEdBQWtCLElBQUksK0JBQWMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ3RGLDBCQUFxQixHQUFVLCtCQUErQixDQUFBO1FBQzlELDBCQUFxQixHQUFVLDhCQUE4QixDQUFBO1FBRTdELGlCQUFZLEdBQW9CLEVBQUUsQ0FBQztRQUNuQyxvQkFBZSxHQUFvQixFQUFFLENBQUM7UUFDdEMsc0JBQWlCLEdBQW9CLEVBQUUsQ0FBQztRQUN4QyxnQkFBVyxHQUFRLElBQUksSUFBSSxFQUFFLENBQUM7SUFtTGhDLENBQUM7SUFqTEMsc0JBQVcsd0NBQU87YUFBbEI7WUFDRSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBLENBQUM7Z0JBQ25DLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUksSUFBSyxPQUFBLElBQUksQ0FBQyxVQUFVLEVBQWYsQ0FBZSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQyxFQUFDLENBQUMsSUFB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