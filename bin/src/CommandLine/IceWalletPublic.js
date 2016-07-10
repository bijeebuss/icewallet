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
                    message: 'Enter the BIP32 xub key for your wallet account',
                    default: null,
                },
            ])
                .then((answers) => {
                try {
                    var wallet = new PublicWalletService_1.PublicWalletService(answers['xpub'].toString(), password.toString());
                }
                catch (err) {
                    return callback('Could not create wallet, make sure you typed the xpub correctly', null);
                }
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
        var choices = {
            initiateWithdraw: 'Initiate Withdraw',
            completeWithdraw: 'Complete Withdraw',
            showBalace: 'Show Balance',
            saveAndQuit: 'Save and Quit (dont quit any other way)'
        };
        inquirer.prompt([
            {
                name: 'choice',
                type: 'list',
                message: 'Choose an option',
                choices: Object.keys(choices).map((choice) => choices[choice]),
            },
            {
                name: 'address',
                message: 'enter the address to send to',
                when: (answers) => {
                    return answers['choice'] == choices.initiateWithdraw;
                },
            },
            {
                name: 'amount',
                message: 'enter the amount to send in satoshis',
                when: (answers) => {
                    return answers['choice'] == choices.initiateWithdraw;
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
            switch (choice) {
                case choices.initiateWithdraw:
                    let amount = Number(answers['amount']);
                    let toAddress = answers['address'].toString();
                    this.initiateWithdraw(toAddress, amount, done);
                    break;
                case choices.completeWithdraw:
                    this.completeWithdraw(done);
                    break;
                case choices.showBalace:
                    console.log("Balance in satoshis: " + this.wallet.balance);
                    this.displayMenu();
                    break;
                case choices.saveAndQuit:
                    this.saveAndQuit((err) => { });
                    break;
                default:
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