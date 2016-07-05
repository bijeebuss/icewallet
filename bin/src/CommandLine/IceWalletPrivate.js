"use strict";
var readline = require('readline');
var fs = require('fs');
var PrivateWalletService_1 = require('../Services/PrivateWalletService');
var WalletInfo_1 = require('../Models/WalletInfo');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHJpdmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Db21tYW5kTGluZS9JY2VXYWxsZXRQcml2YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUN0QyxJQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUMxQixxQ0FBaUMsa0NBQ2pDLENBQUMsQ0FEa0U7QUFDbkUsMkJBQXlCLHNCQUN6QixDQUFDLENBRDhDO0FBSS9DLElBQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUM7SUFDOUIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO0lBQ3BCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtDQUMzQixDQUFDLENBQUM7QUFFSDtJQUlFLDBCQUNTLGdCQUFnQixFQUNoQix5QkFBeUIsRUFDekIsdUJBQXVCLEVBQzlCLFNBQWlCO1FBUnJCLGlCQXVNQztRQWxNVSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQUE7UUFDaEIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFBO1FBQ3pCLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBQTtRQUU1QixFQUFFLENBQUEsQ0FBQyxTQUFTLENBQUMsQ0FBQSxDQUFDO1lBQ1osSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFDLEdBQUcsRUFBQyxNQUFNO2dCQUM5QixFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO29CQUNOLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQixDQUFDO2dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztnQkFDMUMsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ3JCLEtBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFDRCxJ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