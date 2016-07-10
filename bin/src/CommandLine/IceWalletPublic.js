"use strict";
const fs = require('fs');
const inquirer = require('inquirer');
const PublicWalletService_1 = require('../Services/PublicWalletService');
const IceWallet_1 = require('./IceWallet');
class IceWalletPublic extends IceWallet_1.default {
    createNewWallet(callback) {
        inquirer.prompt([
            {
                name: 'password1',
                type: 'password',
                message: 'create a password',
                validate: (password) => { if (!password)
                    return 'Password required';
                else
                    return true; }
            },
            {
                name: 'password2',
                type: 'password',
                message: 'retype password',
                validate: (password) => { if (!password)
                    return 'Password required';
                else
                    return true; }
            }])
            .then((passwords) => {
            if (passwords['password1'] != passwords['password2']) {
                return callback('Passwords dont match', null);
            }
            let password = passwords['password1'];
            inquirer.prompt([
                {
                    name: 'xpub',
                    message: 'Please type the BIP32 xub key for your wallet account',
                    default: null,
                },
            ])
                .then((answers) => {
                let wallet = new PublicWalletService_1.PublicWalletService(answers['xpub'].toString(), password.toString());
                console.log('sucessfully created wallet');
                console.log("updating wallet...");
                wallet.update(callback);
            });
        });
    }
    loadWalletFromInfo(callback) {
        inquirer.prompt({
            name: 'password',
            type: 'password',
            message: 'enter your password to open the wallet',
        })
            .then((answers) => {
            let password = answers['password'].toString();
            console.log('loading and decrypting wallet info from' + this.pathToWalletInfo);
            console.log('this might take a minute');
            fs.readFile(this.pathToWalletInfo, 'hex', (err, data) => {
                if (err) {
                    return callback(err, null);
                }
                PublicWalletService_1.PublicWalletService.openWallet(password, data, (err, info, wallet) => {
                    if (err) {
                        return callback(err, null);
                    }
                    console.log("updating wallet...");
                    return wallet.update(callback);
                });
            });
        });
    }
    displayMenu() {
        var choices = ['Initiate Withdraw', 'Complete Withdraw', 'Show Balance', 'Save and Quit (dont quit any other way)'];
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
                console.log("Balance in satoshis: " + this.wallet.balance);
                this.displayMenu();
            }
            else if (choice == choices[3]) {
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
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IceWalletPublic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHVibGljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0NvbW1hbmRMaW5lL0ljZVdhbGxldFB1YmxpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsTUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFDMUIsTUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUE7QUFDckMsc0NBQWtDLGlDQUNsQyxDQUFDLENBRGtFO0FBQ25FLDRCQUFzQixhQUV0QixDQUFDLENBRmtDO0FBRW5DLDhCQUE2QyxtQkFBUztJQUdwRCxlQUFlLENBQUMsUUFBaUQ7UUFDL0QsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNkO2dCQUNFLElBQUksRUFBQyxXQUFXO2dCQUNoQixJQUFJLEVBQUMsVUFBVTtnQkFDZixPQUFPLEVBQUMsbUJBQW1CO2dCQUMzQixRQUFRLEVBQUMsQ0FBQyxRQUFRLE9BQU0sRUFBRSxDQUFBLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDO2dCQUFDLElBQUk7b0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQSxDQUFBLENBQUM7YUFDcEY7WUFDRDtnQkFDRSxJQUFJLEVBQUMsV0FBVztnQkFDaEIsSUFBSSxFQUFDLFVBQVU7Z0JBQ2YsT0FBTyxFQUFDLGlCQUFpQjtnQkFDekIsUUFBUSxFQUFDLENBQUMsUUFBUSxPQUFNLEVBQUUsQ0FBQSxDQUFDLENBQUMsUUFBUSxDQUFDO29CQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztnQkFBQyxJQUFJO29CQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUEsQ0FBQSxDQUFDO2FBQ3BGLENBQUMsQ0FBQzthQUNGLElBQUksQ0FBQyxDQUFDLFNBQVM7WUFDZCxFQUFFLENBQUEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUEsQ0FBQztnQkFDbkQsTUFBTSxDQUFDLFFB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