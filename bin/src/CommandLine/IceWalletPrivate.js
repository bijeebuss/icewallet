"use strict";
var readline = require('readline');
var fs = require('fs');
var PrivateWalletService_1 = require('../Services/PrivateWalletService');
var WalletInfo_1 = require('../Models/WalletInfo');
var inquirer = require('inquirer');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var IceWalletPrivate = (function () {
    function IceWalletPrivate(pathToWalletInfo, pathToUnsignedTransaction, pathToSignedTransaction, newWallet) {
        var _this = this;
        this.pathToWalletInfo = pathToWalletInfo;
        this.pathToUnsignedTransaction = pathToUnsignedTransaction;
        this.pathToSignedTransaction = pathToSignedTransaction;
        if (newWallet) {
            this.createNewWallet(function (err, wallet) {
                if (err) {
                    return console.log(err);
                }
                console.log('sucessfully created wallet');
                _this.wallet = wallet;
                _this.displayMenu();
            });
        }
        else {
            console.log('loading and decryting wallet from ' + this.pathToWalletInfo);
            this.loadWalletFromInfo('poop', pathToWalletInfo, function (err, wallet) {
                if (err) {
                    return console.log(err);
                }
                console.log('sucessfully loaded wallet');
                _this.wallet = wallet;
                _this.displayMenu();
            });
        }
    }
    IceWalletPrivate.prototype.loadWalletFromInfo = function (password, path, callback) {
        var _this = this;
        console.log('loading and decrypting wallet, this might take a minute');
        fs.readFile(path, 'hex', function (err, data) {
            if (err) {
                return callback(err, null);
            }
            PrivateWalletService_1.default.openWallet(password, data, function (err, info, wallet) {
                if (err == 'SEED_MISSING') {
                    return _this.verifySeed(password, info, callback);
                }
                else if (err) {
                    return callback(err, null);
                }
                return callback(err, wallet);
            });
        });
    };
    IceWalletPrivate.prototype.verifySeed = function (password, info, callback) {
        inquirer.prompt([{
                default: null,
            }]);
        rl.question('the seed is not stored in the info please enter it now to open the wallet\n', function (seed) {
            PrivateWalletService_1.default.seedWallet(password, info, seed, callback);
        });
    };
    IceWalletPrivate.prototype.createNewWallet = function (callback) {
        rl.question('Please create a password for the new wallet \n', function (password1) {
            rl.question('Please retype the password \n', function (password2) {
                if (password1 != password2) {
                    return callback('Passwords dont match', null);
                }
                rl.question('Please type the BIP39 Mnemonic seed for the new wallet, or leave blank for random \n', function (seed) {
                    rl.question('Do you want to export the seed with the wallet info, (exports are always encrypted) y/n? \n', function (exportSeed) {
                        rl.question('What is the starting external address index (default 0) \n', function (externalIndex) {
                            rl.question('What is the starting change address index, (default 0) \n', function (changeIndex) {
                                var info = new WalletInfo_1.WalletInfo();
                                info.seed = seed;
                                info.exportSeed = exportSeed == 'y' ? true : false;
                                info.nextUnusedAddresses.external = Number(externalIndex);
                                info.nextUnusedAddresses.change = Number(changeIndex);
                                return callback(null, new PrivateWalletService_1.default(info, password1));
                            });
                        });
                    });
                });
            });
        });
    };
    IceWalletPrivate.prototype.displayMenu = function () {
        var _this = this;
        console.log('1. deposit');
        console.log('2. withdraw <FeeInBTC>');
        console.log('3. save and quit (dont quit any other way)');
        rl.question('choose an option\n', function (answer) {
            if (answer == '1') {
                _this.deposit();
            }
            else if (answer == '2') {
                var fee = Number(answer.split(' ')[1]);
                _this.withdraw(fee);
            }
            else if (answer == '3') {
                _this.saveAndQuit();
            }
        });
    };
    IceWalletPrivate.prototype.saveInfo = function (encrypted, callback) {
        fs.writeFile(this.pathToWalletInfo, new Buffer(encrypted, 'hex'), function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    };
    IceWalletPrivate.prototype.deposit = function () {
        var _this = this;
        var newAddress = this.wallet.getDepositAddress();
        console.log('Send coins to:' + newAddress);
        rl.question('Did the transaction complete? y/n\n', function (answer) {
            if (answer == 'y') {
                console.log('good');
                _this.wallet.incrementExternalIndex();
            }
            else if (answer == 'n') {
                console.log('try again');
            }
            else {
                console.log('answer either "y" or "n"');
            }
            _this.displayMenu();
        });
    };
    IceWalletPrivate.prototype.verifyTransaction = function (transaction, fee, callback) {
        console.log('Please verify this transaction');
        for (var address in transaction.outputsBTC) {
            console.log('Send: ' + transaction.outputsBTC[address]);
            console.log('To:   ' + address);
        }
        console.log('Fee:  ' + fee);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('answer y/n\n', function (answer) {
            if (answer == 'y') {
                return callback(null);
            }
            else if (answer == 'n') {
                return callback('Fix issues and try again');
            }
            else {
                console.log('answer either "y" or "n"');
                return callback('invalid answer');
            }
        });
    };
    IceWalletPrivate.prototype.withdraw = function (fee) {
        var _this = this;
        fs.readFile(this.pathToUnsignedTransaction, 'utf8', function (err, serialized) {
            if (err) {
                throw err;
            }
            var transactionInfo = _this.wallet.parseTransaction(serialized);
            _this.verifyTransaction(transactionInfo, fee, function (err) {
                if (err) {
                    throw err;
                }
                var signed = _this.wallet.completeTransaction(serialized, fee);
                fs.writeFile(_this.pathToUnsignedTransaction, signed, function (err) {
                    if (err) {
                        throw err;
                    }
                    _this.wallet.incrementChangeIndex();
                    console.log('transaction successfully signed and written to ' + _this.pathToSignedTransaction);
                    _this.displayMenu();
                });
            });
        });
    };
    IceWalletPrivate.prototype.saveAndQuit = function () {
        var _this = this;
        console.log('encerypting and saving wallet to ' + this.pathToWalletInfo);
        this.wallet.exportInfo(function (err, encrypted) {
            if (err) {
                console.log(err);
                return _this.displayMenu();
            }
            _this.saveInfo(encrypted, function (err) {
                if (err) {
                    console.log(err);
                    return _this.displayMenu();
                }
                rl.close();
                console.log('Sucessfully encrypted and saved info, goodbye');
            });
        });
    };
    return IceWalletPrivate;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IceWalletPrivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHJpdmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Db21tYW5kTGluZS9JY2VXYWxsZXRQcml2YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUN0QyxJQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUMxQixxQ0FBaUMsa0NBQ2pDLENBQUMsQ0FEa0U7QUFDbkUsMkJBQXlCLHNCQUN6QixDQUFDLENBRDhDO0FBRS9DLElBQU8sUUFBUSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBRXRDLElBQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUM7SUFDOUIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO0lBQ3BCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtDQUMzQixDQUFDLENBQUM7QUFFSDtJQUlFLDBCQUNTLGdCQUFnQixFQUNoQix5QkFBeUIsRUFDekIsdUJBQXVCLEVBQzlCLFNBQWlCO1FBUnJCLGlCQTBNQztRQXJNVSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQUE7UUFDaEIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFBO1FBQ3pCLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBQTtRQUU1QixFQUFFLENBQUEsQ0FBQyxTQUFTLENBQUMsQ0FBQSxDQUFDO1lBQ1osSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFDLEdBQUcsRUFBQyxNQUFNO2dCQUM5QixFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO29CQUNOLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQixDQUFDO2dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztnQkFDMUMsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ3JCLEtBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZ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