"use strict";
const fs = require('fs');
const PrivateWalletService_1 = require('../Services/PrivateWalletService');
const IceWallet_1 = require('./IceWallet');
const WalletInfo_1 = require('../Models/WalletInfo');
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
                var info = new WalletInfo_1.WalletInfo();
                info.seed = answers['seed'].toString();
                info.exportSeed = Boolean(answers['exportSeed']);
                info.nextUnusedAddresses.external = Number(answers['externalIndex']);
                info.nextUnusedAddresses.change = Number(answers['changeIndex']);
                console.log('sucessfully created wallet');
                return callback(null, new PrivateWalletService_1.default(info, password.toString()));
            });
        });
    }
    displayMenu() {
        var choices = {
            deposit: 'Deposit',
            withdraw: 'Withdraw',
            showUsed: 'Show Used Addresses',
            generateNewAddresses: 'Generate New Addresses',
            saveAndQuit: 'Save and Quit (dont quit any other way)',
        };
        let choicesList = [];
        inquirer.prompt([
            {
                name: 'choice',
                type: 'list',
                message: 'Choose an option',
                choices: Object.keys(choices).map((choice) => choices[choice])
            },
            {
                name: 'fee',
                message: 'enter your desired fee in satoshis',
                when: (answers) => {
                    return answers['choice'] == choices[1];
                },
                validate: (fee) => { if (!Number.isInteger(Number(fee)))
                    return 'Must be an integer';
                else
                    return true; }
            }])
            .then((answers) => {
            let choice = answers['choice'];
            let fee = Number(answers['fee']);
            let done = (err) => {
                if (err) {
                    console.log(err);
                }
                this.displayMenu();
            };
            if (choice == choices.deposit) {
                this.deposit(done);
            }
            else if (choice == choices.withdraw) {
                this.withdraw(fee, done);
            }
            else if (choice == choices.showUsed) {
                this.printAddresses();
                done(null);
            }
            else if (choice == choices.generateNewAddresses) {
                this.generateNewAddresses(done);
            }
            else if (choice == choices.saveAndQuit) {
                this.saveAndQuit((err) => { });
            }
            else {
                this.displayMenu();
            }
        });
    }
    deposit(callback) {
        var newAddress = this.wallet.getDepositAddress();
        console.log('Send coins to:' + newAddress);
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
        for (let address in transaction.outputsBTC) {
            console.log('Send: ' + transaction.outputsBTC[address]);
            console.log('To:   ' + address);
        }
        console.log('Fee:  ' + fee);
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
    }
    printAddresses() {
        console.log('change: ');
        this.wallet.addressRange(0, this.wallet.walletInfo.nextUnusedAddresses.change - 1, true).forEach((address) => {
            console.log('\t' + address);
        });
        console.log('external: ');
        this.wallet.addressRange(0, this.wallet.walletInfo.nextUnusedAddresses.external - 1, false).forEach((address) => {
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
            let starting = this.wallet.walletInfo.nextUnusedAddresses.external;
            let ending = starting + count - 1;
            this.wallet.addressRange(starting, ending, false).forEach((address) => {
                console.log(address);
            });
            if (burn) {
                this.wallet.walletInfo.nextUnusedAddresses.external += count;
            }
            callback(null);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IceWalletPrivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHJpdmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Db21tYW5kTGluZS9JY2VXYWxsZXRQcml2YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUMxQix1Q0FBaUMsa0NBQWtDLENBQUMsQ0FBQTtBQUNwRSw0QkFBc0IsYUFBYSxDQUFDLENBQUE7QUFDcEMsNkJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFFaEQsTUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFFdEMsK0JBQThDLG1CQUFTO0lBR3JELGtCQUFrQixDQUFDLFFBQWtEO1FBQ25FLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDZCxJQUFJLEVBQUMsVUFBVTtZQUNmLElBQUksRUFBQyxVQUFVO1lBQ2YsT0FBTyxFQUFDLHdDQUF3QztTQUNqRCxDQUFDO2FBQ0QsSUFBSSxDQUFDLENBQUMsT0FBTztZQUNaLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQy9FLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUN4QyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSTtnQkFDbEQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztvQkFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUIsQ0FBQztnQkFDRCw4QkFBb0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTTtvQkFD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