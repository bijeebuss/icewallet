"use strict";
var PrivateWallet_1 = require("../src/Models/PrivateWallet");
var PublicWallet_1 = require("../src/Models/PublicWallet");
var bitcore = require('bitcore-lib');
var seed = 'scheme caution cabin snack squeeze busy lava duck bleak cement medal endless';
PrivateWallet_1.PrivateWallet.loadFromInfo('poop', './data/walletInfo.dat', function (err, privateWallet) {
    if (err) {
        throw err;
    }
    var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString();
    console.log(pubKey);
    var publicWallet = new PublicWallet_1.PublicWallet(pubKey);
    publicWallet.update(function (err, wallet) {
        if (err) {
            console.log(err);
        }
        console.log('Confirmed Balance: ' + wallet.balance);
        wallet.initiateTransaction(privateWallet.address(privateWallet.walletInfo.nextUnusedAddresses.external, false), bitcore.Unit.fromBTC(0.001).toSatoshis(), function (err, transaction) {
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
                    privateWallet.deposit();
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3Qvd2FsbGV0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsOEJBQTRCLDZCQUE2QixDQUFDLENBQUE7QUFDMUQsNkJBQTJCLDRCQUE0QixDQUFDLENBQUE7QUFDeEQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBR3JDLElBQUksSUFBSSxHQUFHLDhFQUE4RSxDQUFDO0FBcUIxRiw2QkFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUMsdUJBQXVCLEVBQUUsVUFBQyxHQUFHLEVBQUMsYUFBYTtJQUMzRSxFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO1FBQ04sTUFBTSxHQUFHLENBQUM7SUFDWixDQUFDO0lBRUQsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXBCLElBQUksWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUczQyxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRyxFQUFFLE1BQU07UUFDOUIsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztZQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBR3BELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQUMsR0FBRyxFQUFDLFdBQVc7WUFDeEssRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztnQkFDTixNQUFNLEdBQUcsQ0FBQztZQUNaLENBQUM7WUFDRCxhQUFhLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLFVBQUMsR0FBRyxFQUFDLFdBQVc7Z0JBQ3ZELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7b0JBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFCLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFVBQUMsR0FBRyxFQUFFLElBQUk7b0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7d0JBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7b0JBQ3pCLENBQUM7b0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFFMUQsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxQixDQUFDLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIn0=