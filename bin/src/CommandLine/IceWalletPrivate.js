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
                this.generateNewAddresses = 'Generate New Addresses';
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
                case choices.generateNewAddresses:
                    this.generateNewAddresses(done);
                    break;
                case choices.changeUsedAddresses:
                    this.changeUsedAddresses(done);
                    break;
                case choices.showSeed:
                    console.log(this.wallet.walletInfo.seed);
                    done(null);
                    break;
                case choices.showXpub:
                    console.log(this.wallet.hdPublicKey.toString());
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
                filter: (answer) => {
                    this.pathToUnsignedTransaction = answer;
                    return answer;
                }
            },
            {
                name: 'export',
                message: 'type the export path',
                when: (answers) => {
                    return (!this.pathToSignedTransaction);
                },
                filter: (answer) => {
                    this.pathToSignedTransaction = answer;
                    return answer;
                }
            }])
            .then((answers) => {
            fs.readFile(this.pathToUnsignedTransaction, 'utf8', (err, serialized) => {
                if (err) {
                    return callback(err);
                }
                var transactionInfo = this.wallet.parseTransaction(serialized);
                this.verifyTransaction(transactionInfo, fee, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    var signed = this.wallet.completeTransaction(serialized, fee);
                    fs.writeFile(this.pathToSignedTransaction, signed, (err) => {
                        if (err) {
                            return callback(err);
                        }
                        this.wallet.incrementChangeIndex();
                        console.log('transaction successfully signed and written to ' + this.pathToSignedTransaction);
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
    generateNewAddresses(callback) {
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
            }])
            .then((answers) => {
            let count = Number(answers['count']);
            let burn = Boolean(answers['burn']);
            let starting = this.wallet.nextExternalIndex;
            let ending = starting + count - 1;
            this.wallet.addressRange(starting, ending, false).forEach((address) => {
                console.log(address);
            });
            if (burn) {
                this.wallet.nextExternalIndex += count;
            }
            callback(null);
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