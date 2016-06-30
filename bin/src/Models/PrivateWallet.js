"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
var readline = require('readline');
var WalletInfo_1 = require('./WalletInfo');
var WalletBase_1 = require('./WalletBase');
var fs = require('fs');
var crypto = require('crypto');
var PrivateWallet = (function (_super) {
    __extends(PrivateWallet, _super);
    function PrivateWallet(walletInfo) {
        var walletHdPrivKey = (new Mnemonic(walletInfo.seed)).toHDPrivateKey();
        var accountHdPrivKey = walletHdPrivKey.derive("m/44'/0'/0'");
        _super.call(this, accountHdPrivKey.hdPublicKey.toString());
        this.walletHdPrivKey = walletHdPrivKey;
        this.accountHdPrivKey = accountHdPrivKey;
        this.transactionImportPath = './data/initialTransaction.dat';
        this.transactionExportPath = './data/signedTransaction.dat';
        this.walletInfo = walletInfo;
        if (!this.walletInfo.exportSeed) {
            this.walletInfo.seed = null;
        }
    }
    PrivateWallet.loadFromInfo = function (password, path, callback) {
        fs.readFile(path, 'hex', function (err, data) {
            if (err) {
                return callback(err, null);
            }
            var decipher = crypto.createDecipher(PrivateWallet.cryptoAlgorithm, password);
            var dec = decipher.update(data, 'hex', 'utf8');
            dec += decipher.final('utf8');
            var walletInfo = JSON.parse(dec);
            var wallet = new PrivateWallet(walletInfo);
            wallet.password = password;
            wallet.pathToInfo = path;
            return callback(null, wallet);
        });
    };
    PrivateWallet.createNew = function (password, exportPath, exportSeed, seed, externalIndex, changeIndex) {
        if (exportSeed === void 0) { exportSeed = false; }
        if (seed === void 0) { seed = null; }
        if (externalIndex === void 0) { externalIndex = 0; }
        if (changeIndex === void 0) { changeIndex = 0; }
        if (seed == null) {
            seed = new Mnemonic().toString();
        }
        var info = new WalletInfo_1.WalletInfo();
        info.seed = seed;
        info.exportSeed = exportSeed;
        info.nextUnusedAddresses.external = externalIndex;
        info.nextUnusedAddresses.change = changeIndex;
        var wallet = new PrivateWallet(info);
        wallet.password = password;
        wallet.pathToInfo = exportPath;
        return wallet;
    };
    PrivateWallet.prototype.hdPrivateKey = function (index, change) {
        var chain = change ? 1 : 0;
        return this.accountHdPrivKey.derive(chain).derive(index);
    };
    PrivateWallet.prototype.privateKeyRange = function (start, end, change) {
        var keys = [];
        for (var i = start; i <= end; i++) {
            keys.push(this.hdPrivateKey(i, change).privateKey.toString());
        }
        return keys;
    };
    PrivateWallet.prototype.exportInfo = function (callback) {
        var cipher = crypto.createCipher(PrivateWallet.cryptoAlgorithm, this.password);
        var encrypted = cipher.update(JSON.stringify(this.walletInfo), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        fs.writeFile(this.pathToInfo, new Buffer(encrypted, 'hex'), function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    };
    PrivateWallet.prototype.deposit = function () {
        var _this = this;
        var newAddress = this.address(this.walletInfo.nextUnusedAddresses.external, false);
        console.log('Send coins to:' + newAddress);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Did the transaction complete? y/n\n', function (answer) {
            if (answer == 'y') {
                console.log('good');
                _this.walletInfo.nextUnusedAddresses.external += 1;
                _this.exportInfo(function (err) {
                    if (err) {
                        throw err;
                    }
                });
            }
            else if (answer == 'n') {
                console.log('try again');
            }
            else {
                console.log('answer either "y" or "n"');
            }
            rl.close();
        });
    };
    PrivateWallet.prototype.processTransaction = function (transaction, fee) {
        var indexes = this.walletInfo.nextUnusedAddresses;
        var changePrivateKeys = this.privateKeyRange(0, indexes.change - 1, true);
        var externalPrivateKeys = this.privateKeyRange(0, indexes.external - 1, false);
        transaction
            .change(this.address(indexes.change, true))
            .fee(fee)
            .sign(externalPrivateKeys.concat(changePrivateKeys));
        transaction.serialize();
    };
    PrivateWallet.prototype.verifyTransaction = function (transaction, fee, callback) {
        console.log('Please verify this transaction');
        transaction.outputs.forEach(function (output) {
            console.log('Send: ' + bitcore.Unit.fromSatoshis(output._satoshis).toBTC());
            console.log('To:   ' + output._script.toAddress().toString());
        });
        console.log('Fee:  ' + bitcore.Unit.fromSatoshis(fee).toBTC());
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
                return callback('user declined transaction');
            }
            else {
                console.log('answer either "y" or "n"');
                return callback('invalid answer');
            }
        });
    };
    PrivateWallet.prototype.completeTransaction = function (fee, callback) {
        var _this = this;
        fs.readFile(this.transactionImportPath, 'utf8', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            var transaction = new bitcore.Transaction(JSON.parse(results));
            _this.verifyTransaction(transaction, fee, function (err) {
                if (err) {
                    return callback(err, transaction);
                }
                _this.processTransaction(transaction, fee);
                if (!transaction.isFullySigned()) {
                    return callback('transaction is not fully signed, check yourself before you wreck yourself', transaction);
                }
                fs.writeFile(_this.transactionExportPath, JSON.stringify(transaction.toObject()), function (err) {
                    if (err) {
                        return callback(err, transaction);
                    }
                    _this.walletInfo.nextUnusedAddresses.change += 1;
                    _this.exportInfo(function (err) {
                        if (err) {
                            return callback(err, transaction);
                        }
                        console.log('transaction successfully signed and written to ' + _this.transactionExportPath);
                        return callback(null, transaction);
                    });
                });
            });
        });
    };
    PrivateWallet.cryptoAlgorithm = 'aes-256-ctr';
    PrivateWallet.saltRounds = 10;
    return PrivateWallet;
}(WalletBase_1.default));
exports.PrivateWallet = PrivateWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvUHJpdmF0ZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDM0MsSUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFDdEMsMkJBQXlCLGNBQ3pCLENBQUMsQ0FEc0M7QUFDdkMsMkJBQXVCLGNBQ3ZCLENBQUMsQ0FEb0M7QUFDckMsSUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFFMUIsSUFBTyxNQUFNLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFJbEM7SUFBNEIsaUNBQVU7SUFnRHBDLHVCQUFZLFVBQXFCO1FBQy9CLElBQUksZUFBZSxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkUsSUFBSSxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdELGtCQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMscUJBQXFCLEdBQUcsK0JBQStCLENBQUM7UUFDN0QsSUFBSSxDQUFDLHFCQUFxQixHQUFHLDhCQUE4QixDQUFDO1FBQzVELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQSxDQUFDO1lBQy9CLElBQUks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