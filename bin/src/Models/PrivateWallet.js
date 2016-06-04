"use strict";
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
var PrivateWallet = (function () {
    function PrivateWallet(seed) {
        var mnemonic = new Mnemonic(seed);
        this.masterHdPrivKey = mnemonic.toHDPrivateKey();
        this.accountHdPrivKey = this.masterHdPrivKey.derive("m/44'/0'/0'");
    }
    return PrivateWallet;
}());
exports.PrivateWallet = PrivateWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvUHJpdmF0ZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRzNDO0lBSUUsdUJBQVksSUFBWTtRQUN0QixJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNoRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVILG9CQUFDO0FBQUQsQ0FBQyxBQVZELElBVUM7QUFFTyxxQkFBYSxpQkFGcEI7QUFFc0IifQ==