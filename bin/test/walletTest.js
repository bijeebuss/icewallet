"use strict";
var PrivateWallet_1 = require("../src/Models/PrivateWallet");
var PublicWallet_1 = require("../src/Models/PublicWallet");
var bitcore = require('bitcore-lib');
var seed = 'scheme caution cabin snack squeeze busy lava duck bleak cement medal endless';
var privateWallet = PrivateWallet_1.PrivateWallet.createNew('poop', './data/walletInfo.dat', false, seed, 6, 4);
var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString();
console.log(pubKey);
var publicWallet = new PublicWallet_1.PublicWallet(pubKey);
publicWallet.update(function (err, wallet) {
    if (err) {
        console.log(err);
    }
    console.log('Confirmed Balance: ' + wallet.balance);
    wallet.initiateTransaction(privateWallet.address(5, false), bitcore.Unit.fromBTC(0.0095).toSatoshis(), function (err, transaction) {
        if (err) {
            throw err;
        }
        privateWallet.completeTransaction(12000, function (err, transaction) {
            if (err) {
                return console.log(err);
            }
            wallet.broadcastTransaction(function (err, txid) {
                if (err) {
                    return console.log(err);
                }
                console.log('transaction broadcasted with txid: ' + txid);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3Qvd2FsbGV0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsOEJBQTRCLDZCQUE2QixDQUFDLENBQUE7QUFDMUQsNkJBQTJCLDRCQUE0QixDQUFDLENBQUE7QUFDeEQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBR3JDLElBQUksSUFBSSxHQUFHLDhFQUE4RSxDQUFDO0FBQzFGLElBQUksYUFBYSxHQUFHLDZCQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSx1QkFBdUIsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUvRixJQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFBO0FBQ2xFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFcEIsSUFBSSxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBSTNDLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFHLEVBQUUsTUFBTTtJQUM5QixFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO1FBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEQsTUFBTSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQUMsR0FBRyxFQUFDLFdBQVc7UUFDcEgsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztZQUNOLE1BQU0sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUNELGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsVUFBQyxHQUFHLEVBQUMsV0FBVztZQUN2RCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNQLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFDRCxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBQyxHQUFHLEVBQUUsSUFBSTtnQkFDcEMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztvQkFDUCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDekIsQ0FBQztnQkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQzVELENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFBIn0=