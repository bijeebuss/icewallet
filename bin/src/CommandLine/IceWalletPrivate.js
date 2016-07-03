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
    function IceWalletPrivate(pathToWalletInfo, pathToUnsignedTransaction, pathToSignedTransaction) {
        var _this = this;
        this.pathToWalletInfo = pathToWalletInfo;
        this.pathToUnsignedTransaction = pathToUnsignedTransaction;
        this.pathToSignedTransaction = pathToSignedTransaction;
        console.log('loading and decrypting wallet, this might take a minute');
        this.loadWalletFromInfo('poop', pathToWalletInfo, function (err, wallet) {
            if (err) {
                return console.log(err);
            }
            console.log('sucessfully loaded wallet');
            _this.wallet = wallet;
            _this.displayMenu();
        });
    }
    IceWalletPrivate.prototype.loadWalletFromInfo = function (password, path, callback) {
        var _this = this;
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
            rl.close();
            PrivateWalletService_1.default.seedWallet(password, info, seed, callback);
        });
    };
    IceWalletPrivate.prototype.createNewWallet = function (password, exportSeed, seed, externalIndex, changeIndex) {
        if (exportSeed === void 0) { exportSeed = false; }
        if (seed === void 0) { seed = null; }
        if (externalIndex === void 0) { externalIndex = 0; }
        if (changeIndex === void 0) { changeIndex = 0; }
        var info = new WalletInfo_1.WalletInfo();
        info.seed = seed;
        info.exportSeed = exportSeed;
        info.nextUnusedAddresses.external = externalIndex;
        info.nextUnusedAddresses.change = changeIndex;
        return new PrivateWalletService_1.default(info, password);
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
            rl.close();
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
            rl.close();
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
            rl.close();
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
                console.log('Sucessfully encrypted and saved info, goodbye');
            });
        });
    };
    return IceWalletPrivate;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IceWalletPrivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0UHJpdmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Db21tYW5kTGluZS9JY2VXYWxsZXRQcml2YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUN0QyxJQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUMxQixxQ0FBaUMsa0NBQ2pDLENBQUMsQ0FEa0U7QUFDbkUsMkJBQXlCLHNCQUN6QixDQUFDLENBRDhDO0FBRy9DLElBQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUM7SUFDOUIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO0lBQ3BCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtDQUMzQixDQUFDLENBQUM7QUFFSDtJQUlFLDBCQUNTLGdCQUFnQixFQUNoQix5QkFBeUIsRUFDekIsdUJBQXVCO1FBUGxDLGlCQTRLQztRQXZLVSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQUE7UUFDaEIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFBO1FBQ3pCLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBQTtRQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUE7UUFDdEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxVQUFDLEdBQUcsRUFBQyxNQUFNO1lBQzNELEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ04sTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUN6QyxLQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixLQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUE7SUFDSixD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