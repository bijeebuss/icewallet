"use strict";
const fs = require('fs');
const PrivateWalletService_1 = require('../Services/PrivateWalletService');
const WalletInfo_1 = require('../Models/WalletInfo');
const inquirer = require('inquirer');
class IceWalletPrivate {
    constructor(pathToWalletInfo, pathToUnsignedTransaction, pathToSignedTransaction, newWallet, callback) {
        this.pathToWalletInfo = pathToWalletInfo;
        this.pathToUnsignedTransaction = pathToUnsignedTransaction;
        this.pathToSignedTransaction = pathToSignedTransaction;
        let done = (err, wallet) => {
            if (err && callback) {
                return callback(err, null);
            }
            else if (err) {
                return console.log(err);
            }
            console.log('sucessfully loaded wallet');
            this.wallet = wallet;
            if (callback) {
                return callback(null, this);
            }
            else {
                this.displayMenu();
            }
        };
        if (newWallet) {
            this.createNewWallet(done);
        }
        else {
            console.log('loading and decryting wallet from ' + this.pathToWalletInfo);
            this.loadWalletFromInfo(done);
        }
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
        var choices = ['Deposit', 'Withdraw', 'Save and Quit (dont quit any other way)'];
        inquirer.prompt([
            {
                name: 'choice',
                type: 'list',
                message: 'Choose an option',
                choices: choices,
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
            if (choice == choices[0]) {
                this.deposit(done);
            }
            else if (choice == choices[1]) {
                this.withdraw(fee, done);
            }
            else if (choice == choices[2]) {
                this.saveAndQuit(done);
            }
            else {
                this.displayMenu();
            }
        });
    }
    saveInfo(encrypted, callback) {
        fs.writeFile(this.pathToWalletInfo, new Buffer(encrypted, 'hex'), (err) => {
            if (err) {
                return callback(err);
            }
            return callback(null);
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
    saveAndQuit(callback) {
        console.log('encerypting and saving wallet to ' + this.pathToWalletInfo);
        this.wallet.exportInfo((err, encrypted) => {
            if (err) {
                return callback(err);
            }
            this.saveInfo(encrypted, (err) => {
                if (err) {
                    return callback(err);
                }
                console.log('Sucessfully encrypted and saved info, goodbye');
                return callback(null);
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IceWalletPrivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHJpdmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Db21tYW5kTGluZS9JY2VXYWxsZXRQcml2YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUMxQix1Q0FBaUMsa0NBQ2pDLENBQUMsQ0FEa0U7QUFDbkUsNkJBQXlCLHNCQUN6QixDQUFDLENBRDhDO0FBRS9DLE1BQU8sUUFBUSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBRXRDO0lBSUUsWUFDUyxnQkFBdUIsRUFDdkIseUJBQWdDLEVBQ2hDLHVCQUE4QixFQUNyQyxTQUFpQixFQUNqQixRQUErQztRQUp4QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQU87UUFDdkIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFPO1FBQ2hDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBTztRQUluQyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBQyxNQUEyQjtZQUN6QyxFQUFFLENBQUEsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLENBQUEsQ0FBQztnQkFDaEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUNILElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNaLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsRUFBRSxDQUFBLENBQUMsUUFBUSxDQUFDLENBQUEsQ0FBQztnQkFDWCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBQ0QsSUFBSSxD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