"use strict";
var bitcore = require('bitcore-lib');
var request = require('request');
var PublicWallet = (function () {
    function PublicWallet(publicKey) {
        this.insightUrl = 'https://insight.bitpay.com/api/';
        this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
    }
    PublicWallet.prototype.getAddress = function (index) {
        return new bitcore.Address(this.hdPublicKey.derive(0).derive(index).publicKey);
    };
    PublicWallet.prototype.getBalance = function (index) {
        if (index != null) {
            request.get(this.insightUrl + 'addr/' + this.getAddress(index).toString(), function (err, resp, body) { return console.log(body); });
        }
    };
    return PublicWallet;
}());
exports.PublicWallet = PublicWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1B1YmxpY1dhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQU8sT0FBTyxXQUFXLFNBQVMsQ0FBQyxDQUFDO0FBRXBDO0lBS0Usc0JBQVksU0FBaUI7UUFGN0IsZUFBVSxHQUFVLGlDQUFpQyxDQUFDO1FBR3BELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFHRCxpQ0FBVSxHQUFWLFVBQVcsS0FBWTtRQUNyQixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsaUNBQVUsR0FBVixVQUFXLEtBQWE7UUFDdEIsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFBLENBQUM7WUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUN2RSxVQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsSUFBSSxJQUFLLE9BQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBakIsQ0FBaUIsQ0FDckMsQ0FBQTtRQUNILENBQUM7SUFDSCxDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBckJELElBcUJDO0FBRU8sb0JBQVksZ0JBRm5CO0FBRXFCIn0=