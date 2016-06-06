"use strict";
var bitcore = require('bitcore-lib');
var async = require('async');
var InsightService_1 = require("../Services/InsightService");
var PublicWallet = (function () {
    function PublicWallet(publicKey) {
        this.insightService = new InsightService_1.InsightService('https://insight.bitpay.com/api/');
        this.utxos = [];
        this.lastUpdated = new Date();
        this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
    }
    Object.defineProperty(PublicWallet.prototype, "balance", {
        get: function () {
            return this.utxos.map(function (utxo) { return utxo.amount; }).reduce(function (p, c) { return c + p; });
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
    PublicWallet.prototype.getUtxos = function (change, callback) {
        var startingAddress = 0;
        var addrs = this.getAddressRange(startingAddress, startingAddress + 19, change);
        var self = this;
        function combineUtxos(err, resp, body) {
            if (err) {
                callback(err, null);
                return;
            }
            var utxos = JSON.parse(body);
            if (utxos.length > 0) {
                utxos.forEach(function (utxo) { return self.utxos.push(utxo); });
                startingAddress += 20;
                addrs = self.getAddressRange(startingAddress, startingAddress + 19, change);
                self.insightService.getUtxos(addrs, combineUtxos);
            }
            else {
                callback(err, self.utxos);
            }
        }
        this.insightService.getUtxos(addrs, combineUtxos);
    };
    PublicWallet.prototype.update = function (callback) {
        var _this = this;
        async.parallel([
            function (callback) { return _this.getUtxos(false, callback); },
            function (callback) { return _this.getUtxos(true, callback); }
        ], function (err, result) {
            _this.lastUpdated = new Date(Date.now());
            callback(err, _this);
        });
    };
    return PublicWallet;
}());
exports.PublicWallet = PublicWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZGVscy9QdWJsaWNXYWxsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQyxJQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQztBQUNoQywrQkFBNkIsNEJBQzdCLENBQUMsQ0FEd0Q7QUFHekQ7SUFXRSxzQkFBWSxTQUFpQjtRQVY3QixtQkFBYyxHQUFrQixJQUFJLCtCQUFjLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUV0RixVQUFLLEdBQWEsRUFBRSxDQUFDO1FBQ3JCLGdCQUFXLEdBQVEsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQVE1QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBUEQsc0JBQVcsaUNBQU87YUFBbEI7WUFDRSxNQUFNLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLENBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLEdBQUcsQ0FBQyxFQUFMLENBQUssQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7OztPQUFBO0lBUUQsaUNBQVUsR0FBVixVQUFXLEtBQVksRUFBRSxNQUFjO1FBQ3JDLElBQUksS0FBSyxHQUFVLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxz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