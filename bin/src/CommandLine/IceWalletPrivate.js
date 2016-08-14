"use strict";
const fs = require('fs');
let qrcode = require('qrcode-terminal');
let unit = require('bitcore-lib').Unit;
let intl = require('intl');
const PrivateWalletService_1 = require('../Services/PrivateWalletService');
const IceWallet_1 = require('./IceWallet');
const PrivateWalletInfo_1 = require('../Models/PrivateWalletInfo');
const inquirer = require('inquirer');
class IceWalletPrivate extends IceWallet_1.default {
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
                PrivateWalletService_1.default.openWallet(password, data, (err, info, wallet) => {
                    if (err == 'SEED_MISSING') {
                        return this.verifySeed(password, info, callback);
                    }
                    else if (err) {
                        return callback(err, null);
                    }
                    return callback(err, wallet);
                });
            });
        });
    }
    verifySeed(password, info, callback) {
        inquirer.prompt([{
                name: 'seed',
                message: 'the seed is not stored in the info please enter it now to open the wallet',
            }])
            .then((answers) => {
            console.log('verifying seed...');
            PrivateWalletService_1.default.seedWallet(password, info, answers['seed'].toString(), callback);
        });
    }
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
                    name: 'seed',
                    message: 'Please type the BIP39 Mnemonic seed for the new wallet, or leave blank for random',
                    default: null,
                },
                {
                    name: 'exportSeed',
                    message: 'Do you want to export the seed with the wallet info, (exports are always encrypted)?',
                    type: 'confirm',
                },
            ])
                .then((answers) => {
                var info = new PrivateWalletInfo_1.PrivateWalletInfo(answers['seed'].toString(), Boolean(answers['exportSeed']));
                try {
                    var wallet = new PrivateWalletService_1.default(info, password.toString());
                }
                catch (err) {
                    return callback(err, null);
                }
                console.log('sucessfully created wallet');
                return callback(null, wallet);
            });
        });
    }
    addAccount(callback) {
        inquirer.prompt([
            {
                name: 'name',
                message: 'Give a name for this account, be descriptive',
            },
            {
                name: 'index',
                message: 'what is the BIP32 derivation index for this account',
                validate: (externalIndex) => { if (!Number.isInteger(Number(externalIndex)))
                    return 'Must be an integer';
                else
                    return true; }
            },
            {
                name: 'externalIndex',
                message: 'What is the starting external address index',
                default: 0,
                validate: (externalIndex) => { if (!Number.isInteger(Number(externalIndex)))
                    return 'Must be an integer';
                else
                    return true; }
            },
            {
                name: 'changeIndex',
                message: 'What is the starting change address index',
                default: 0,
                validate: (changeIndex) => { if (!Number.isInteger(Number(changeIndex)))
                    return 'Must be an integer';
                else
                    return true; }
            },
        ])
            .then((answers) => {
            this.wallet.walletInfo.addAccount(answers['name'], Number(answers['index']), Number(answers['changeIndex']), Number(answers['externalIndex']));
            return callback(null);
        });
    }
    displayAccountMenu() {
        class Choices {
            constructor() {
                this.deposit = 'Deposit';
                this.sign = 'Sign Transaction';
                this.showUsed = 'Show Used Addresses';
                this.exportAddresses = 'Export Addresses';
                this.showSeed = 'Show seed';
                this.showXpub = 'Show Account Public Key';
                this.changeUsedAddresses = 'Update Used Address Indexes';
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
                choices: Object.keys(choices).map(choice => choices[choice])
            },
            {
                name: 'fee',
                message: 'enter your desired fee in bits',
                when: (answers) => {
                    return answers['choice'] == choices.sign;
                },
                validate: (fee) => { if (!Number.isInteger(Number(fee)))
                    return 'Must be an integer';
                else
                    return true; }
            }])
            .then((answers) => {
            let choice = answers['choice'];
            let fee = Number(unit.fromBits(answers['fee']).satoshis);
            let done = (err) => {
                if (err) {
                    console.log(err);
                }
                if (choice != choices.saveAndQuit) {
                    this.displayAccountMenu();
                }
            };
            switch (choice) {
                case choices.deposit:
                    this.deposit(done);
                    break;
                case choices.sign:
                    this.sign(fee, done);
                    break;
                case choices.showUsed:
                    this.printAddresses();
                    done(null);
                    break;
                case choices.exportAddresses:
                    this.exportAddresses(done);
                    break;
                case choices.changeUsedAddresses:
                    this.changeUsedAddresses(done);
                    break;
                case choices.showSeed:
                    console.log(this.wallet.walletInfo.seed);
                    done(null);
                    break;
                case choices.showXpub:
                    qrcode.generate(this.wallet.selectedAccount.xpub);
                    console.log(this.wallet.selectedAccount.xpub);
                    this.displayAccountMenu();
                    break;
                case choices.backToMain:
                    this.displayMainMenu();
                    break;
                case choices.saveAndQuit:
                    this.saveAndQuit(done);
                    break;
                default:
                    this.displayAccountMenu();
            }
        });
    }
    deposit(callback) {
        var newAddress = this.wallet.getDepositAddress();
        console.log('Send coins to:' + newAddress);
        qrcode.generate(newAddress);
        inquirer.prompt({
            name: 'choice',
            message: 'Did the transaction complete?',
            type: 'confirm'
        })
            .then((answers) => {
            if (answers['choice']) {
                console.log('good');
                this.wallet.incrementExternalIndex();
            }
            else if (answers['choice']) {
                console.log('try again');
            }
            return callback(null);
        });
    }
    verifyTransaction(transaction, fee, callback) {
        console.log('Please verify this transaction');
        for (let address in transaction.outputTotals) {
            console.log('Send: ' + unit.fromSatoshis(transaction.outputTotals[address]).bits.toLocaleString() + ' bits');
            console.log('To:   ' + address);
        }
        console.log('Fee:  ' + unit.fromSatoshis(fee).bits.toLocaleString() + ' bits');
        inquirer.prompt({
            name: 'complete',
            type: 'confirm',
            message: 'answer y/n',
        })
            .then((answers) => {
            let complete = answers['complete'];
            if (complete) {
                return callback(null);
            }
            else {
                return callback('Fix issues and try again');
            }
        });
    }
    sign(fee, callback) {
        inquirer.prompt([
            {
                name: 'import',
                message: 'type the import path (path to unsigned transaction)',
                when: (answers) => {
                    return (!this.pathToUnsignedTransaction);
                },
            },
            {
                name: 'export',
                message: 'type the export path',
                when: (answers) => {
                    return (!this.pathToSignedTransaction);
                },
            }])
            .then((answers) => {
            var outputPath = this.pathToSignedTransaction || answers['export'];
            var importPath = this.pathToUnsignedTransaction || answers['import'];
            fs.readFile(importPath || answers['import'], 'utf8', (err, serialized) => {
                if (err) {
                    return callback(err);
                }
                var transactionInfo = this.wallet.parseTransaction(serialized);
                this.verifyTransaction(transactionInfo, fee, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    try {
                        var signed = this.wallet.completeTransaction(serialized, fee);
                    }
                    catch (err) {
                        return callback(err);
                    }
                    fs.writeFile(outputPath, signed, (err) => {
                        if (err) {
                            return callback(err);
                        }
                        this.wallet.incrementChangeIndex();
                        console.log('transaction successfully signed and written to: ' + outputPath);
                        return callback(null);
                    });
                });
            });
        });
    }
    printAddresses() {
        console.log('change: ');
        this.wallet.addressRange(0, this.wallet.nextChangeIndex - 1, true).forEach((address) => {
            console.log('\t' + address);
        });
        console.log('external: ');
        this.wallet.addressRange(0, this.wallet.nextExternalIndex - 1, false).forEach((address) => {
            console.log('\t' + address);
        });
    }
    exportAddresses(callback) {
        inquirer.prompt([
            {
                name: 'count',
                message: 'How many addresses?',
                validate: (fee) => { if (!Number.isInteger(Number(fee)))
                    return 'Must be an integer';
                else
                    return true; }
            },
            {
                name: 'burn',
                message: 'Mark these as used? (may cause issues updating public wallet if you dont use them then deposit to this account again)',
                type: 'confirm',
            },
            {
                name: 'path',
                message: 'Type the export path',
            },
        ])
            .then((answers) => {
            let count = Number(answers['count']);
            let burn = Boolean(answers['burn']);
            let path = answers['path'];
            let starting = this.wallet.nextExternalIndex;
            let ending = starting + count - 1;
            var addresses = this.wallet.addressRange(starting, ending, false);
            fs.writeFile(path, JSON.stringify(addresses), (err) => {
                addresses.forEach((address) => {
                    console.log(address);
                });
                if (burn) {
                    this.wallet.nextExternalIndex += count;
                }
                console.log('Adress list saved to ' + path);
                callback(null);
            });
        });
    }
    changeUsedAddresses(callback) {
        inquirer.prompt([
            {
                name: 'externalIndex',
                message: 'How many external addresses have been used',
                default: 0,
                validate: (externalIndex) => { if (!Number.isInteger(Number(externalIndex)))
                    return 'Must be an integer';
                else
                    return true; }
            },
            {
                name: 'changeIndex',
                message: 'How many change addresses have been used',
                default: 0,
                validate: (changeIndex) => { if (!Number.isInteger(Number(changeIndex)))
                    return 'Must be an integer';
                else
                    return true; }
            },
        ])
            .then((answers) => {
            this.wallet.nextExternalIndex = Number(answers['externalIndex']);
            this.wallet.nextChangeIndex = Number(answers['changeIndex']);
            console.log('sucessfully updated wallet');
            return callback(null);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IceWalletPrivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHJpdmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Db21tYW5kTGluZS9JY2VXYWxsZXRQcml2YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUMxQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUN4QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3ZDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQix1Q0FBaUMsa0NBQWtDLENBQUMsQ0FBQTtBQUNwRSw0QkFBc0IsYUFBYSxDQUFDLENBQUE7QUFDcEMsb0NBQWdDLDZCQUE2QixDQUFDLENBQUE7QUFFOUQsTUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFFdEMsK0JBQThDLG1CQUFTO0lBR3JELGtCQUFrQixDQUFDLFFBQXNEO1FBQ3ZFLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDZCxJQUFJLEVBQUMsVUFBVTtZQUNmLElBQUksRUFBQyxVQUFVO1lBQ2YsT0FBTyxFQUFDLHdDQUF3QztTQUNqRCxDQUFDO2FBQ0QsSUFBSSxDQUFDLENBQUMsT0FBVztZQUNoQixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMvRSxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDeEMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUk7Z0JBQ2xELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFB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