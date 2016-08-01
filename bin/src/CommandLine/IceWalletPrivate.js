"use strict";
const fs = require('fs');
let qrcode = require('qrcode-terminal');
let unit = require('bitcore-lib').Unit;
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
                var info = new PrivateWalletInfo_1.PrivateWalletInfo(answers['seed'].toString(), Boolean(answers['exportSeed']));
                info.addAccount('Default', 0, Number(answers['changeIndex']), Number(answers['externalIndex']));
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
    displayMainMenu() {
        class Choices {
            constructor() {
                this.saveAndQuit = 'Save and Quit (dont quit any other way)';
            }
        }
        let choices = new Choices();
        inquirer.prompt([
            {
                name: 'choice',
                type: 'list',
                message: 'Choose an option',
                choices: Object.keys(choices).map(choice => choices[choice])
            },
            {
                name: 'account',
                type: 'list',
                message: 'Choose an existing account',
                when: answers => answers['choice'] == choices.selectAccount,
                choices: this.wallet.walletInfo.accounts.map(account => account.name),
            }])
            .then((answers) => {
            let choice = answers['choice'];
            let account = answers['account'];
            let done = (err) => {
                if (err) {
                    console.log(err);
                }
                if (choice != choices.saveAndQuit) {
                    this.displayMenu();
                }
            };
            switch (choice) {
                case choices.deposit:
                    this.deposit(done);
                    break;
                case choices.withdraw:
                    this.withdraw(fee, done);
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
                    this.displayMenu();
                    break;
                case choices.saveAndQuit:
                    this.saveAndQuit(done);
                    break;
                default:
                    this.displayMenu();
            }
        });
    }
    displayAccountMenu() {
        class Choices {
            constructor() {
                this.deposit = 'Deposit';
                this.withdraw = 'Withdraw';
                this.showUsed = 'Show Used Addresses';
                this.generateNewAddresses = 'Generate New Addresses';
                this.showSeed = 'Show seed';
                this.showXpub = 'Show Account Public Key';
                this.changeUsedAddresses = 'Update Used Address Indexes';
                this.saveAndQuit = 'Save and Quit (dont quit any other way)';
            }
        }
        let choices = new Choices();
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
                    return answers['choice'] == choices.withdraw;
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
                    this.displayMenu();
                }
            };
            switch (choice) {
                case choices.deposit:
                    this.deposit(done);
                    break;
                case choices.withdraw:
                    this.withdraw(fee, done);
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
                    this.displayMenu();
                    break;
                case choices.saveAndQuit:
                    this.saveAndQuit(done);
                    break;
                default:
                    this.displayMenu();
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
            console.log('Send: ' + unit.fromSatoshis(transaction.outputTotals[address]).bits + 'bits');
            console.log('To:   ' + address);
        }
        console.log('Fee:  ' + unit.fromSatoshis(fee).bits + 'bits');
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
    withdraw(fee, callback) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHJpdmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Db21tYW5kTGluZS9JY2VXYWxsZXRQcml2YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUMxQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUN4QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3ZDLHVDQUFpQyxrQ0FBa0MsQ0FBQyxDQUFBO0FBQ3BFLDRCQUFzQixhQUFhLENBQUMsQ0FBQTtBQUNwQyxvQ0FBZ0MsNkJBQTZCLENBQUMsQ0FBQTtBQUU5RCxNQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUV0QywrQkFBOEMsbUJBQVM7SUFHckQsa0JBQWtCLENBQUMsUUFBc0Q7UUFDdkUsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNkLElBQUksRUFBQyxVQUFVO1lBQ2YsSUFBSSxFQUFDLFVBQVU7WUFDZixPQUFPLEVBQUMsd0NBQXdDO1NBQ2pELENBQUM7YUFDRCxJQUFJLENBQUMsQ0FBQyxPQUFXO1lBQ2hCLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQy9FLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUN4QyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSTtnQkFDbEQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztvQkFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBQyxJQUFJ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