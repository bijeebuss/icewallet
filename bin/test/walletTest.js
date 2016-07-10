"use strict";
const PublicWalletService_1 = require('../src/Services/PublicWalletService');
const IceWalletPrivate_1 = require('../src/CommandLine/IceWalletPrivate');
var bitcore = require('bitcore-lib');
var seed = 'scheme caution cabin snack squeeze busy lava duck bleak cement medal endless';
new IceWalletPrivate_1.default('/Users/Michael/iceWallets/old.dat', process.env.HOME + '/unsignedTransaction.dat', process.env.HOME + '/signedTransaction.dat', false, (err, iceWallet) => {
    if (err) {
        throw err;
    }
    var privateWallet = iceWallet.wallet;
    var pubKey = privateWallet.accountHdPrivKey.hdPublicKey.toString();
    console.log(pubKey);
    var publicWallet = new PublicWalletService_1.PublicWalletService(pubKey, privateWallet.password);
    publicWallet.update((err, wallet) => {
        if (err) {
            console.log(err);
        }
        console.log('Confirmed Balance: ' + wallet.balance);
        wallet.initiateTransaction('1NeQmcmKN3NqXGbe88rk15gwDHiBK6YMce', 1970000, (err, transaction) => {
            if (err) {
                throw err;
            }
            iceWallet.withdraw(12000, (err) => {
                if (err) {
                    return console.log(err);
                }
                wallet.broadcastTransaction((err, txid) => {
                    if (err) {
                        return console.log(err);
                    }
                    console.log('transaction broadcasted with txid: ' + txid);
                    iceWallet.deposit((err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3Qvd2FsbGV0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0Esc0NBQWtDLHFDQUFxQyxDQUFDLENBQUE7QUFFeEUsbUNBQTZCLHFDQUFxQyxDQUFDLENBQUE7QUFDbkUsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRXJDLElBQUksSUFBSSxHQUFHLDhFQUE4RSxDQUFDO0FBRTFGLElBQUksMEJBQWdCLENBQ2xCLG1DQUFtQyxFQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRywwQkFBMEIsRUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsd0JBQXdCLEVBQzNDLEtBQUssRUFDTCxDQUFDLEdBQUcsRUFBQyxTQUFTO0lBQ1osRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztRQUNOLE1BQU0sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUNELElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFDckMsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXBCLElBQUksWUFBWSxHQUFHLElBQUkseUNBQW1CLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUUzRSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU07UUFDOUIsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztZQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXBELE1BQU0sQ0FBQyxtQkFBbUIsQ0FDeEIsb0NBQW9DLEVBQ3BDLE9BQU8sRUFDUCxDQUFDLEdBQUcsRUFBQyxXQUFXO1lBQ2QsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztnQkFDTixNQUFNLEdBQUcsQ0FBQztZQUNaLENBQUM7WUFDRCxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUc7Z0JBQzVCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7b0JBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFCLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLElBQUk7b0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7d0JBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7b0JBQ3pCLENBQUM7b0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFFMUQsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUc7d0JBQ3BCLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7NEJBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDbkIsQ0FBQztvQkFDSCxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FDRixDQUFBIn0=