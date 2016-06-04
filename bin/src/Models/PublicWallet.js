"use strict";
var bitcore = require('bitcore-lib');
var InsightService_1 = require("../Services/InsightService");
var PublicWallet = (function () {
    function PublicWallet(publicKey) {
        this.insightService = new InsightService_1.InsightService('https://insight.bitpay.com/api/');
        this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
    }
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
    PublicWallet.prototype.getWalletBalance = function (callback) {
        var addrs = this.getAddressRange(0, 20, false);
        this.insightService.getUtxos(addrs, callback);
    };
    return PublicWallet;
}());
exports.PublicWallet = PublicWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZGVscy9QdWJsaWNXYWxsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQywrQkFBNkIsNEJBQzdCLENBQUMsQ0FEd0Q7QUFHekQ7SUFLRSxzQkFBWSxTQUFpQjtRQUY3QixtQkFBYyxHQUFrQixJQUFJLCtCQUFjLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUdwRixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBR0QsaUNBQVUsR0FBVixVQUFXLEtBQVksRUFBRSxNQUFjO1FBQ3JDLElBQUksS0FBSyxHQUFVLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxzQ0FBZSxHQUFmLFVBQWdCLEtBQVksRUFBRSxHQUFVLEVBQUUsTUFBYztRQUN0RCxJQUFJLFNBQVMsR0FBWSxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVUsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQztZQUN4QyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVELHdDQUFpQixHQUFqQixVQUFrQixLQUFZLEVBQUUsTUFBYyxFQUFFLFFBQWdDO1FBQzlFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ3RELElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUN2RCxDQUFDO0lBRUQsdUNBQWdCLEdBQWhCLFVBQWlCLFFBQWdDO1FBQy9DLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxLQUFLLENBQUMsQ0FBQTtRQUM1QyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQWhDRCxJQWdDQztBQUdPLG9CQUFZLGdCQUhuQjtBQUdxQiJ9