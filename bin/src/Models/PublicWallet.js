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
        var startingAddress = 0;
        var endingAddress = startingAddress + 19;
        var addrs = this.getAddressRange(startingAddress, endingAddress, false);
        var allUtxos = [];
        var self = this;
        this.insightService.getUtxos(addrs, function (err, resp, body) {
            if (err) {
                console.log(err);
                return;
            }
            var utxos = JSON.parse(body);
            if (utxos.length > 0) {
                allUtxos.push(utxos);
                startingAddress += 20;
                endingAddress += 20;
                addrs = self.getAddressRange(startingAddress, endingAddress, false);
                self.insightService.getUtxos(addrs, this);
            }
            else {
                callback(err, resp, allUtxos);
            }
        });
    };
    return PublicWallet;
}());
exports.PublicWallet = PublicWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZGVscy9QdWJsaWNXYWxsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQywrQkFBNkIsNEJBQzdCLENBQUMsQ0FEd0Q7QUFHekQ7SUFLRSxzQkFBWSxTQUFpQjtRQUY3QixtQkFBYyxHQUFrQixJQUFJLCtCQUFjLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUdwRixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBR0QsaUNBQVUsR0FBVixVQUFXLEtBQVksRUFBRSxNQUFjO1FBQ3JDLElBQUksS0FBSyxHQUFVLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxzQ0FBZSxHQUFmLFVBQWdCLEtBQVksRUFBRSxHQUFVLEVBQUUsTUFBYztRQUN0RCxJQUFJLFNBQVMsR0FBWSxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVUsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQztZQUN4QyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVELHdDQUFpQixHQUFqQixVQUFrQixLQUFZLEVBQUUsTUFBYyxFQUFFLFFBQWdDO1FBQzlFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ3RELElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUN2RCxDQUFDO0lBRUQsdUNBQWdCLEdBQWhCLFVBQWlCLFFBQWdDO1FBQy9DLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLGFBQWEsR0FBRyxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBQ3pDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFDLGFBQWEsRUFBQyxLQUFLLENBQUMsQ0FBQztRQUN0RSxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWhCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxVQUFTLEdBQUcsRUFBQyxJQUFJLEVBQUMsSUFBSTtZQUN4RCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ2hCLE1BQU0sQ0FBQztZQUNULENBQUM7WUFDRCxJQUFJLEtBQUssR0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25DLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUEsQ0FBQztnQkFDcEIsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDckIsZUFBZSxJQUFJLEVBQUUsQ0FBQztnQkFDdEIsYUFBYSxJQUFNLEVBQUUsQ0FBQztnQkFDdEIsS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFDLGFBQWEsRUFBQyxLQUFLLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVDLENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQztnQkFDSixRQUFRLENBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxRQUFRLENBQUMsQ0FBQTtZQUM3QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBckRELElBcURDO0FBR08sb0JBQVksZ0JBSG5CO0FBR3FCIn0=