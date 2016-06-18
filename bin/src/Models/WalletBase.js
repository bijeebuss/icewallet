"use strict";
var bitcore = require('bitcore-lib');
var WalletBase = (function () {
    function WalletBase(publicKey) {
        this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
    }
    WalletBase.prototype.address = function (index, change) {
        var chain = change ? 1 : 0;
        return new bitcore.Address(this.hdPublicKey.derive(chain).derive(index).publicKey).toString();
    };
    WalletBase.prototype.addressRange = function (start, end, change) {
        var addresses = [];
        for (var i = start; i <= end; i++) {
            addresses.push(this.address(i, change));
        }
        return addresses;
    };
    return WalletBase;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WalletBase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FsbGV0QmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvV2FsbGV0QmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRXJDO0lBR0Usb0JBQVksU0FBaUI7UUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUdELDRCQUFPLEdBQVAsVUFBUSxLQUFZLEVBQUUsTUFBYztRQUNsQyxJQUFJLEtBQUssR0FBVSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNoRyxDQUFDO0lBRUQsaUNBQVksR0FBWixVQUFhLEtBQVksRUFBRSxHQUFVLEVBQUUsTUFBYztRQUNuRCxJQUFJLFNBQVMsR0FBWSxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVUsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQztZQUN4QyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUNILGlCQUFDO0FBQUQsQ0FBQyxBQXBCRCxJQW9CQztBQXBCRDs0QkFvQkMsQ0FBQSJ9