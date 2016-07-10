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