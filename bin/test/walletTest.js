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
    wallet.createTransaction('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', bitcore.Unit.fromBTC(0.005).toSatoshis(), function (err, transaction) {
        console.log(transaction);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3Qvd2FsbGV0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw4QkFBNEIsNkJBQTZCLENBQUMsQ0FBQTtBQUMxRCw2QkFBMkIsNEJBQTRCLENBQUMsQ0FBQTtBQUN4RCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFHckMsSUFBSSxhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLDhFQUE4RSxDQUFDLENBQUM7QUFFdEgsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtBQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRXBCLElBQUksWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQWUzQyxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRyxFQUFFLE1BQU07SUFDOUIsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztRQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUNELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxvQ0FBb0MsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxVQUFDLEdBQUcsRUFBRSxXQUFXO1FBQ3hILE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDMUIsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSJ9