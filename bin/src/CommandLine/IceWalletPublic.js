"use strict";
const fs = require('fs');
let unit = require('bitcore-lib').Unit;
const inquirer = require('inquirer');
const PublicWalletService_1 = require('../Services/PublicWalletService');
const PublicWalletInfo_1 = require('../Models/PublicWalletInfo');
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
                    var info = new PublicWalletInfo_1.PublicWalletInfo();
                    info.addAccount(answers['xpub'].toString(), 'Default', 0, 0, 0);
                    var wallet = new PublicWalletService_1.PublicWalletService(info, password.toString());
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
        class Choices {
            constructor() {
                this.initiateWithdraw = 'Initiate Withdraw';
                this.completeWithdraw = 'Complete Withdraw';
                this.showBalace = 'Show Balance';
                this.update = 'Update';
                this.saveAndQuit = 'Save and Quit (dont quit any other way)';
            }
        }
        let choices = new Choices();
        inquirer.prompt([
            {
                name: 'choice',
                type: 'list',
                message: 'Choose an option',
                choices: Object.keys(choices).map((choice) => choices[choice].toString()),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHVibGljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0NvbW1hbmRMaW5lL0ljZVdhbGxldFB1YmxpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsTUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFDMUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN2QyxNQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQTtBQUNyQyxzQ0FBa0MsaUNBQ2xDLENBQUMsQ0FEa0U7QUFDbkUsbUNBQStCLDRCQUMvQixDQUFDLENBRDBEO0FBQzNELDRCQUFzQixhQUV0QixDQUFDLENBRmtDO0FBRW5DLDhCQUE2QyxtQkFBUztJQUdwRCxlQUFlLENBQUMsUUFBcUQ7UUFDbkUsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNkO2dCQUNFLElBQUksRUFBQyxXQUFXO2dCQUNoQixJQUFJLEVBQUMsVUFBVTtnQkFDZixPQUFPLEVBQUMsbUJBQW1CO2dCQUMzQixRQUFRLEVBQUMsQ0FBQyxRQUFRLE9BQU0sRUFBRSxDQUFBLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDO2dCQUFDLElBQUk7b0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQSxDQUFBLENBQUM7YUFDcEY7WUFDRDtnQkFDRSxJQUFJLEVBQUMsV0FBVztnQkFDaEIsSUFBSSxFQUFDLFVBQVU7Z0JBQ2YsT0FBTyxFQUFDLGlCQUFpQjtnQkFDekIsUUFBUSxFQUFDLENBQUMsUUFBUSxPQUFNLEVBQUUsQ0FBQSxDQUFDLENBQUMsUUFBUSxDQUFDO29CQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztnQkFBQyxJQUFJO29CQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUEsQ0FBQSxDQUFDO2FBQ3BGLENBQUMsQ0FBQzthQUNGLElBQUksQ0FBQyxDQUFDLFNBQWE7WUFDbEIsRUFBRSxD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