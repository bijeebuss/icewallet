"use strict";
const fs = require('fs');
let qrcode = require('qrcode-terminal');
let unit = require('bitcore-lib').Unit;
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
    displayMenu() {
        var choices = {
            deposit: 'Deposit',
            withdraw: 'Withdraw',
            showUsed: 'Show Used Addresses',
            generateNewAddresses: 'Generate New Addresses',
            showSeed: 'Show seed',
            showXpub: 'Show Account Public Key',
            changeUsedAddresses: 'Update Used Address Indexes',
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
            this.wallet.walletInfo.nextUnusedAddresses.external = Number(answers['externalIndex']);
            this.wallet.walletInfo.nextUnusedAddresses.change = Number(answers['changeIndex']);
            console.log('sucessfully updated wallet');
            return callback(null);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IceWalletPrivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHJpdmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Db21tYW5kTGluZS9JY2VXYWxsZXRQcml2YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUMxQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUN4QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3ZDLHVDQUFpQyxrQ0FBa0MsQ0FBQyxDQUFBO0FBQ3BFLDRCQUFzQixhQUFhLENBQUMsQ0FBQTtBQUNwQyw2QkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRCxNQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUV0QywrQkFBOEMsbUJBQVM7SUFHckQsa0JBQWtCLENBQUMsUUFBa0Q7UUFDbkUsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNkLElBQUksRUFBQyxVQUFVO1lBQ2YsSUFBSSxFQUFDLFVBQVU7WUFDZixPQUFPLEVBQUMsd0NBQXdDO1NBQ2pELENBQUM7YUFDRCxJQUFJLENBQUMsQ0FBQyxPQUFPO1lBQ1osSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMseUNBQXlDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDL0UsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ3hDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJO2dCQUNsRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO29CQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFDLElBQUks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