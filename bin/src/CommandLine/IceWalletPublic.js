"use strict";
const fs = require('fs');
let unit = require('bitcore-lib').Unit;
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
            update: 'Update',
            saveAndQuit: 'Save and Quit (dont quit any other way)'
        };
        inquirer.prompt([
            {
                name: 'choice',
                type: 'list',
                message: 'Choose an option',
                choices: Object.keys(choices).map((choice) => choices[choice]),
            }])
            .then((answers) => {
            let choice = answers['choice'];
            let done = (err) => {
                if (err) {
                    console.log(err);
                }
                if (choice != choices.saveAndQuit) {
                    this.displayMenu();
                }
            };
            switch (choice) {
                case choices.initiateWithdraw:
                    this.initiateWithdraw(done);
                    break;
                case choices.completeWithdraw:
                    this.completeWithdraw(done);
                    break;
                case choices.showBalace:
                    console.log("Balance in bits: " + unit.fromSatoshis(this.wallet.balance).bits);
                    this.displayMenu();
                    break;
                case choices.saveAndQuit:
                    this.saveAndQuit(done);
                    break;
                case choices.update:
                    console.log('Updating Wallet...');
                    this.wallet.update((err, wallet) => done(err));
                    break;
                default:
                    this.displayMenu();
            }
        });
    }
    initiateWithdraw(callback) {
        inquirer.prompt([
            {
                name: 'export',
                message: 'type the export path',
                when: (answers) => {
                    return (!this.pathToUnsignedTransaction);
                },
                filter: (answer) => {
                    this.pathToUnsignedTransaction = answer;
                    return answer;
                }
            },
            {
                name: 'address',
                message: 'enter the address to send to',
            },
            {
                name: 'amount',
                message: 'enter the amount to send in bits',
                validate: amount => { if (!Number.isInteger(Number(amount)))
                    return 'Must be an integer';
                else
                    return true; }
            }])
            .then((answers) => {
            let to = answers['address'];
            let amount = Number(unit.fromBits(answers['amount']).satoshis);
            this.wallet.createTransaction(to, amount, (err, serialized) => {
                if (err) {
                    return callback(err);
                }
                fs.writeFile(this.pathToUnsignedTransaction, serialized, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    console.log('transaction written to ' + this.pathToUnsignedTransaction);
                    console.log('sign the transaction offline then complete it');
                    return callback(null);
                });
            });
        });
    }
    completeWithdraw(callback) {
        inquirer.prompt([
            {
                name: 'import',
                message: 'type the import path (path to signed transaction)',
                when: (answers) => {
                    return (!this.pathToSignedTransaction);
                },
                filter: (answer) => {
                    this.pathToSignedTransaction = answer;
                    return answer;
                }
            }])
            .then((answers) => {
            fs.readFile(this.pathToSignedTransaction, 'utf8', (err, data) => {
                if (err) {
                    return callback(err);
                }
                this.wallet.broadcastTransaction(data, (err, txid) => {
                    console.log('transaction successfully broadcasted with txid: ' + txid);
                    return callback(null);
                });
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IceWalletPublic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHVibGljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0NvbW1hbmRMaW5lL0ljZVdhbGxldFB1YmxpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsTUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFDMUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN2QyxNQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQTtBQUNyQyxzQ0FBa0MsaUNBQ2xDLENBQUMsQ0FEa0U7QUFDbkUsNEJBQXNCLGFBRXRCLENBQUMsQ0FGa0M7QUFFbkMsOEJBQTZDLG1CQUFTO0lBR3BELGVBQWUsQ0FBQyxRQUFpRDtRQUMvRCxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ2Q7Z0JBQ0UsSUFBSSxFQUFDLFdBQVc7Z0JBQ2hCLElBQUksRUFBQyxVQUFVO2dCQUNmLE9BQU8sRUFBQyxtQkFBbUI7Z0JBQzNCLFFBQVEsRUFBQyxDQUFDLFFBQVEsT0FBTSxFQUFFLENBQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQztvQkFBQyxNQUFNLENBQUMsbUJBQW1CLENBQUM7Z0JBQUMsSUFBSTtvQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFBLENBQUEsQ0FBQzthQUNwRjtZQUNEO2dCQUNFLElBQUksRUFBQyxXQUFXO2dCQUNoQixJQUFJLEVBQUMsVUFBVTtnQkFDZixPQUFPLEVBQUMsaUJBQWlCO2dCQUN6QixRQUFRLEVBQUMsQ0FBQyxRQUFRLE9BQU0sRUFBRSxDQUFBLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDO2dCQUFDLElBQUk7b0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQSxDQUFBLENBQUM7YUFDcEYsQ0FBQyxDQUFDO2FBQ0YsSUFBSSxDQUFDLENBQUMsU0FBUztZQUNkLEVBQUUsQ0FBQSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFB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