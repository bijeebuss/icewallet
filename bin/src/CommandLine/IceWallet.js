"use strict";
const fs = require('fs');
class IceWallet {
    constructor(pathToWalletInfo, pathToUnsignedTransaction, pathToSignedTransaction, newWallet, callback) {
        this.pathToWalletInfo = pathToWalletInfo;
        this.pathToUnsignedTransaction = pathToUnsignedTransaction;
        this.pathToSignedTransaction = pathToSignedTransaction;
        let done = (err, wallet) => {
            if (err && callback) {
                return callback(err, null);
            }
            else if (err) {
                return console.log(err);
            }
            console.log('sucessfully loaded wallet');
            this.wallet = wallet;
            if (callback) {
                return callback(null, this);
            }
            this.displayMenu();
        };
        if (newWallet) {
            this.createNewWallet(done);
        }
        else {
            console.log('loading and decryting wallet from ' + this.pathToWalletInfo);
            this.loadWalletFromInfo(done);
        }
    }
    saveAndQuit(callback) {
        console.log('encerypting and saving wallet to ' + this.pathToWalletInfo);
        this.wallet.exportInfo((err, encrypted) => {
            if (err) {
                return callback(err);
            }
            this.saveInfo(encrypted, (err) => {
                if (err) {
                    return callback(err);
                }
                console.log('Sucessfully encrypted and saved info, goodbye');
                return callback(null);
            });
        });
    }
    saveInfo(encrypted, callback) {
        fs.writeFile(this.pathToWalletInfo, new Buffer(encrypted, 'hex'), (err) => {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IceWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0NvbW1hbmRMaW5lL0ljZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsTUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFFMUI7SUFHRSxZQUNTLGdCQUF1QixFQUN2Qix5QkFBZ0MsRUFDaEMsdUJBQThCLEVBQ3JDLFNBQWlCLEVBQ2pCLFFBQTRDO1FBSnJDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBTztRQUN2Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQU87UUFDaEMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFPO1FBSW5DLElBQUksSUFBSSxHQUFHLENBQUMsR0FBTyxFQUFFLE1BQW9CO1lBQ3ZDLEVBQUUsQ0FBQSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQSxDQUFDO2dCQUNoQixNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUM1QixDQUFDO1lBQ0gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ1osTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixFQUFFLENBQUEsQ0FBQyxRQUFRLENBQUMsQ0FBQSxDQUFDO2dCQUNYLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUM7WUFDRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFBO1FBRUQsRUFBRSxDQUFBLENBQUMsU0FBUyxDQUFDLENBQUEsQ0FBQztZQUNaLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDNUIsQ0FBQztRQUNELElBQUksQ0FBQSxDQUFDO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtZQUN6RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQztJQUNMLENBQUM7SUFDRCxXQUFXLENBQUMsUUFBMEI7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUN4RSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxTQUFTO1lBQ3BDLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ04sTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QixDQUFDO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHO2dCQUMzQixFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO29CQUNOLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO2dCQUM3RCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsUUFBUSxDQUFDLFNBQWdCLEVBQUUsUUFBMEI7UUFDbkQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRztZQUNuRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0FBS0gsQ0FBQztBQUVEO2tCQUFlLFNBQVMsQ0FBQSJ9