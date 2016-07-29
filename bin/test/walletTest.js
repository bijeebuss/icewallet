"use strict";
const PublicWalletService_1 = require('../src/Services/PublicWalletService');
const PrivateWalletService_1 = require('../src/Services/PrivateWalletService');
const PrivateWalletInfo_1 = require('../src/Models/PrivateWalletInfo');
var bitcore = require('bitcore-lib');
var seed = 'scheme caution cabin snack squeeze busy lava duck bleak cement medal endless';
var walletInfo = new PrivateWalletInfo_1.PrivateWalletInfo(seed, true);
walletInfo.addAccount('Default', 0, 20, 20);
var privateWallet = new PrivateWalletService_1.default(walletInfo, 'secret');
var pubKey = privateWallet.hdPublicKey.toString();
console.log(pubKey);
var publicWallet = new PublicWalletService_1.PublicWalletService(pubKey, privateWallet.password);
publicWallet.update((err, wallet) => {
    if (err) {
        console.log(err);
    }
    console.log('Confirmed Balance: ' + wallet.balance);
    wallet.createTransaction('1BbRFw5nvkZDRK56qtCvcy1yFR3Q2nWPgf', 1000, (err, transaction) => {
        if (err) {
            throw err;
        }
        var signedTransaction = privateWallet.completeTransaction(transaction, 15000);
        wallet.broadcastTransaction(signedTransaction, (err, txid) => {
            if (err) {
                return console.log(err);
            }
            console.log('transaction broadcasted with txid: ' + txid);
            privateWallet.incrementExternalIndex();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3Qvd2FsbGV0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0Esc0NBQWtDLHFDQUFxQyxDQUFDLENBQUE7QUFDeEUsdUNBQWlDLHNDQUFzQyxDQUFDLENBQUE7QUFDeEUsb0NBQWdDLGlDQUNoQyxDQUFDLENBRGdFO0FBQ2pFLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUVyQyxJQUFJLElBQUksR0FBRyw4RUFBOEUsQ0FBQztBQUMxRixJQUFJLFVBQVUsR0FBRyxJQUFJLHFDQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuRCxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQzVDLElBQUksYUFBYSxHQUFHLElBQUksOEJBQW9CLENBQUMsVUFBVSxFQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2xFLElBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUVwQixJQUFJLFlBQVksR0FBRyxJQUFJLHlDQUFtQixDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFM0UsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNO0lBQzlCLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7UUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVwRCxNQUFNLENBQUMsaUJBQWlCLENBQ3RCLG9DQUFvQyxFQUNwQyxJQUFJLEVBQ0osQ0FBQyxHQUFHLEVBQUMsV0FBVztRQUNkLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7WUFDTixNQUFNLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFDRCxJQUFJLGlCQUFpQixHQUFHLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFOUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixFQUFFLENBQUMsR0FBRyxFQUFFLElBQUk7WUFDdkQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztnQkFDUCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUN6QixDQUFDO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUMxRCxhQUFhLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUEifQ==