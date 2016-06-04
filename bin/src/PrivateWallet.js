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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Qcml2YXRlV2FsbGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFHM0M7SUFJRSx1QkFBWSxJQUFZO1FBQ3RCLElBQUksUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ2hELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUgsb0JBQUM7QUFBRCxDQUFDLEFBVkQsSUFVQztBQUVPLHFCQUFhLGlCQUZwQjtBQUVzQiJ9