"use strict";
var bitcore = require('bitcore-lib');
var async = require('async');
var InsightService_1 = require("../Services/InsightService");
var PublicWallet = (function () {
    function PublicWallet(publicKey) {
        this.insightService = new InsightService_1.InsightService('https://insight.bitpay.com/api/');
        this.transactions = [];
        this.lastUpdated = new Date();
        this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
    }
    Object.defineProperty(PublicWallet.prototype, "balance", {
        get: function () {
            return this.transactions.map(function (utxo) { return utxo.amount; }).reduce(function (p, c) { return c + p; });
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
    PublicWallet.prototype.getAddressBalance = function (index, change, callback) {
        var address = this.getAddress(index, change).toString();
        this.insightService.getAddressInfo(address, callback);
    };
    PublicWallet.prototype.getTransactions = function (change, callback) {
        var startingAddress = 0;
        var addrs = this.getAddressRange(startingAddress, startingAddress + 19, change);
        var self = this;
        function combine(err, resp, body) {
            if (err) {
                callback(err, null);
                return;
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
    PublicWallet.prototype.update = function (callback) {
        var _this = this;
        async.parallel([
            function (callback) { return _this.getTransactions(false, callback); },
            function (callback) { return _this.getTransactions(true, callback); }
        ], function (err, result) {
            _this.lastUpdated = new Date(Date.now());
            callback(err, _this);
        });
    };
    return PublicWallet;
}());
exports.PublicWallet = PublicWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZGVscy9QdWJsaWNXYWxsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQyxJQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQztBQUNoQywrQkFBNkIsNEJBQzdCLENBQUMsQ0FEd0Q7QUFHekQ7SUFVRSxzQkFBWSxTQUFpQjtRQVQ3QixtQkFBYyxHQUFrQixJQUFJLCtCQUFjLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUV0RixpQkFBWSxHQUFvQixFQUFFLENBQUM7UUFDbkMsZ0JBQVcsR0FBUSxJQUFJLElBQUksRUFBRSxDQUFDO1FBTzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFORCxzQkFBVyxpQ0FBTzthQUFsQjtZQUNFLE1BQU0sQ0FBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUksSUFBSyxPQUFBLElBQUksQ0FBQyxNQUFNLEVBQVgsQ0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQyxFQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsR0FBRyxDQUFDLEVBQUwsQ0FBSyxDQUFDLENBQUM7UUFDOUUsQ0FBQzs7O09BQUE7SUFPRCxpQ0FBVSxHQUFWLFVBQVcsS0FBWSxFQUFFLE1BQWM7UUFDckMsSUFBSSxLQUFLLEdBQVUsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVE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