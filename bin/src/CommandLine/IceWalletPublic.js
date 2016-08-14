"use strict";
const fs = require('fs');
let unit = require('bitcore-lib').Unit;
let intl = require('intl');
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
            try {
                var info = new PublicWalletInfo_1.PublicWalletInfo();
                var wallet = new PublicWalletService_1.PublicWalletService(info, password.toString());
            }
            catch (err) {
                return callback('Could not create wallet, make sure you typed the xpub correctly', null);
            }
            console.log('sucessfully created wallet');
            return callback(null, wallet);
        });
    }
    addAccount(callback) {
        inquirer.prompt([
            {
                name: 'xpub',
                message: 'Enter the BIP32 xub key for your wallet account',
                default: null,
            },
            {
                name: 'name',
                message: 'Give the account a name',
                default: null,
            },
        ])
            .then((answers) => {
            this.wallet.walletInfo.addAccount(answers['xpub'].toString(), answers['name'].toString());
            return callback(null);
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
                    return callback(null, wallet);
                });
            });
        });
    }
    displayAccountMenu() {
        class Choices {
            constructor() {
                this.initiateWithdraw = 'Initiate Withdraw';
                this.completeWithdraw = 'Complete Withdraw';
                this.showBalace = 'Show Balance';
                this.showXpub = 'Show xpub';
                this.update = 'Update';
                this.nextUnusedIndexes = 'Show next Unused Indexes';
                this.backToMain = 'Back To Main Menu';
                this.saveAndQuit = 'Save and Quit (dont quit any other way)';
            }
        }
        let choices = new Choices();
        console.log('----------' + this.wallet.selectedAccount.name + '----------');
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
                    this.displayAccountMenu();
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
                    console.log("Balance in bits: " + unit.fromSatoshis(this.wallet.balance).bits.toLocaleString());
                    this.displayAccountMenu();
                    break;
                case choices.showXpub:
                    console.log(this.wallet.selectedAccount.xpub);
                    this.displayAccountMenu();
                    break;
                case choices.saveAndQuit:
                    this.saveAndQuit(done);
                    break;
                case choices.backToMain:
                    this.displayMainMenu();
                    break;
                case choices.update:
                    console.log('Updating Wallet...');
                    this.wallet.update((err, wallet) => done(err));
                    break;
                case choices.nextUnusedIndexes:
                    console.log('Change: ' + this.wallet.changeAddresses.length);
                    console.log('External: ' + this.wallet.externalAddresses.length);
                    this.displayAccountMenu();
                    break;
                default:
                    this.displayAccountMenu();
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
            let exportPath = this.pathToUnsignedTransaction || answers['export'];
            let to = answers['address'];
            let amount = Number(unit.fromBits(answers['amount']).satoshis);
            this.wallet.createTransaction(to, amount, (err, serialized) => {
                if (err) {
                    return callback(err);
                }
                fs.writeFile(exportPath, serialized, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    console.log('transaction written to: ' + exportPath);
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
            }])
            .then((answers) => {
            var importPath = this.pathToSignedTransaction || answers['import'];
            fs.readFile(importPath, 'utf8', (err, data) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHVibGljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0NvbW1hbmRMaW5lL0ljZVdhbGxldFB1YmxpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsTUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFDMUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN2QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0IsTUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUE7QUFDckMsc0NBQWtDLGlDQUNsQyxDQUFDLENBRGtFO0FBQ25FLG1DQUErQiw0QkFDL0IsQ0FBQyxDQUQwRDtBQUMzRCw0QkFBc0IsYUFHdEIsQ0FBQyxDQUhrQztBQUduQyw4QkFBNkMsbUJBQVM7SUFHcEQsZUFBZSxDQUFDLFFBQXFEO1FBQ25FLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDZDtnQkFDRSxJQUFJLEVBQUMsV0FBVztnQkFDaEIsSUFBSSxFQUFDLFVBQVU7Z0JBQ2YsT0FBTyxFQUFDLG1CQUFtQjtnQkFDM0IsUUFBUSxFQUFDLENBQUMsUUFBUSxPQUFNLEVBQUUsQ0FBQSxDQUFDLENBQUMsUUFBUSxDQUFDO29CQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztnQkFBQyxJQUFJO29CQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUEsQ0FBQSxDQUFDO2FBQ3BGO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFDLFdBQVc7Z0JBQ2hCLElBQUksRUFBQyxVQUFVO2dCQUNmLE9BQU8sRUFBQyxpQkFBaUI7Z0JBQ3pCLFFBQVEsRUFBQyxDQUFDLFFBQVEsT0FBTSxFQUFFLENBQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQztvQkFBQyxNQUFNLENBQUMsbUJBQW1CLENBQUM7Z0JBQUMsSUFBSTtvQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFBLENBQUEsQ0FBQzthQUNwRixD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