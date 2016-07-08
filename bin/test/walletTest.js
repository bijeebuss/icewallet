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
    var publicWallet = new PublicWalletService_1.PublicWalletService(pubKey);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3Qvd2FsbGV0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0Esc0NBQWtDLHFDQUFxQyxDQUFDLENBQUE7QUFFeEUsbUNBQTZCLHFDQUFxQyxDQUFDLENBQUE7QUFDbkUsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRXJDLElBQUksSUFBSSxHQUFHLDhFQUE4RSxDQUFDO0FBRTFGLElBQUksMEJBQWdCLENBQ2xCLG1DQUFtQyxFQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRywwQkFBMEIsRUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsd0JBQXdCLEVBQzNDLEtBQUssRUFDTCxDQUFDLEdBQUcsRUFBQyxTQUFTO0lBQ1osRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztRQUNOLE1BQU0sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUNELElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFDckMsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXBCLElBQUksWUFBWSxHQUFHLElBQUkseUNBQW1CLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFbEQsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNO1FBQzlCLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7WUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLENBQUM7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVwRCxNQUFNLENBQUMsbUJBQW1CLENBQ3hCLG9DQUFvQyxFQUNwQyxPQUFPLEVBQ1AsQ0FBQyxHQUFHLEVBQUMsV0FBVztZQUNkLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ04sTUFBTSxHQUFHLENBQUM7WUFDWixDQUFDO1lBQ0QsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHO2dCQUM1QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO29CQUNQLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQixDQUFDO2dCQUNELE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJO29CQUNwQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO3dCQUNQLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO29CQUN6QixDQUFDO29CQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLEdBQUcsSUFBSSxDQUFDLENBQUM7b0JBRTFELFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHO3dCQUNwQixFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDOzRCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ25CLENBQUM7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FDRixDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQ0YsQ0FBQSJ9