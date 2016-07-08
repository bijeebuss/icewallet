"use strict";
const fs = require('fs');
const inquirer = require('inquirer');
class IceWalletPublic {
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
            else {
                this.displayMenu();
            }
        };
        if (newWallet) {
            this.createNewWallet(done);
        }
        else {
            console.log('loading and decryting wallet from ' + this.pathToWalletInfo);
            this.loadWalletFromInfo(done);
        }
    }
    displayMenu() {
        var choices = ['Initiate Withdraw', 'Complete Withdraw', 'Save and Quit (dont quit any other way)'];
        inquirer.prompt([
            {
                name: 'choice',
                type: 'list',
                message: 'Choose an option',
                choices: choices,
            },
            {
                name: 'address',
                message: 'enter the address to send to',
                when: (answers) => {
                    return answers['choice'] == choices[0];
                },
                validate: (fee) => { if (!Number.isInteger(Number(fee)))
                    return 'Must be an integer';
                else
                    return true; }
            },
            {
                name: 'amount',
                message: 'enter the amount to send in satoshis',
                when: (answers) => {
                    return answers['choice'] == choices[0];
                },
                validate: (fee) => { if (!Number.isInteger(Number(fee)))
                    return 'Must be an integer';
                else
                    return true; }
            }])
            .then((answers) => {
            let choice = answers['choice'];
            let done = (err) => {
                if (err) {
                    console.log(err);
                }
                this.displayMenu();
            };
            if (choice == choices[0]) {
                let amount = Number(answers['amount']);
                let toAddress = answers['address'].toString();
                this.initiateWithdraw(toAddress, amount, done);
            }
            else if (choice == choices[1]) {
                this.completeWithdraw(done);
            }
            else if (choice == choices[2]) {
                this.saveAndQuit(done);
            }
            else {
                this.displayMenu();
            }
        });
    }
    initiateWithdraw(to, amount, callback) {
        this.wallet.createTransaction(to, amount, (err, serialized) => {
            fs.writeFile(this.pathToUnsignedTransaction, serialized, (err) => {
                if (err) {
                    return callback(err);
                }
                console.log('transaction written to ' + this.pathToUnsignedTransaction);
                console.log('sign the transaction offline then complete it');
                return callback(null);
            });
        });
    }
    completeWithdraw(callback) {
        fs.readFile(this.pathToSignedTransaction, 'utf8', (err, data) => {
            if (err) {
                return callback(err);
            }
            this.wallet.broadcastTransaction(data, (err, txid) => {
                console.log('transaction successfully broadcasted with txid: ' + txid);
                return callback(null);
            });
        });
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
exports.default = IceWalletPublic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHVibGljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0NvbW1hbmRMaW5lL0ljZVdhbGxldFB1YmxpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsTUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFDMUIsTUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUE7QUFHckM7SUFHQSxZQUNXLGdCQUF1QixFQUN2Qix5QkFBZ0MsRUFDaEMsdUJBQThCLEVBQ3JDLFNBQWlCLEVBQ2pCLFFBQThDO1FBSnZDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBTztRQUN2Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQU87UUFDaEMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFPO1FBSW5DLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFDLE1BQTBCO1lBQ3hDLEVBQUUsQ0FBQSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQSxDQUFDO2dCQUNoQixNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUM1QixDQUFDO1lBQ0gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ1osTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixFQUFFLENBQUEsQ0FBQyxRQUFRLENBQUMsQ0FBQSxDQUFDO2dCQUNYLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUM7WUFDRCxJQUFJLENBQUEsQ0FBQztnQkFDSCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckIsQ0FBQztRQUNILENBQUMsQ0FB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