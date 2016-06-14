"use strict";
var PrivateWallet_1 = require("../src/Models/PrivateWallet");
var PublicWallet_1 = require("../src/Models/PublicWallet");
var bitcore = require('bitcore-lib');
var privateWallet = new PrivateWallet_1.PrivateWallet('scheme caution cabin snack squeeze busy lava duck bleak cement medal endless');
var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString();
console.log(pubKey);
var publicWallet = new PublicWallet_1.PublicWallet(pubKey);
publicWallet.update(function (err, wallet) {
    if (err) {
        console.log(err);
    }
    return wallet.initiateTransaction(privateWallet.address(3, false), bitcore.Unit.fromBTC(0.0075).toSatoshis());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3Qvd2FsbGV0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsOEJBQTRCLDZCQUE2QixDQUFDLENBQUE7QUFDMUQsNkJBQTJCLDRCQUE0QixDQUFDLENBQUE7QUFDeEQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBR3JDLElBQUksYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyw4RUFBOEUsQ0FBQyxDQUFDO0FBRXRILElBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUVwQixJQUFJLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUMsTUFBTSxDQUFDLENBQUE7QUFJM0MsWUFBWSxDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQUcsRUFBRSxNQUFNO0lBQzlCLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7UUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDL0csQ0FBQyxDQUFDLENBQUEifQ==