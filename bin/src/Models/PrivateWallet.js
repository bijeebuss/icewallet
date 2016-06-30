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
            crypto.pbkdf2(password, PrivateWallet.slt, PrivateWallet.keyIterations, PrivateWallet.keyLength, PrivateWallet.keyDigest, function (err, key) {
                if (err) {
                    return callback(err, wallet);
                }
                var decipher = crypto.createDecipher(PrivateWallet.cryptoAlgorithm, key.toString('hex'));
                var dec = decipher.update(data, 'hex', 'utf8');
                dec += decipher.final('utf8');
                var walletInfo = JSON.parse(dec);
                var wallet = new PrivateWallet(walletInfo);
                wallet.password = password;
                wallet.pathToInfo = path;
                return callback(null, wallet);
            });
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
        var _this = this;
        crypto.pbkdf2(this.password, PrivateWallet.slt, PrivateWallet.keyIterations, PrivateWallet.keyLength, PrivateWallet.keyDigest, function (err, key) {
            if (err) {
                return callback(err);
            }
            var cipher = crypto.createCipher(PrivateWallet.cryptoAlgorithm, key.toString('hex'));
            var encrypted = cipher.update(JSON.stringify(_this.walletInfo), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            fs.writeFile(_this.pathToInfo, new Buffer(encrypted, 'hex'), function (err) {
                if (err) {
                    return callback(err);
                }
                return callback(null);
            });
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
    PrivateWallet.keyDigest = 'sha512';
    PrivateWallet.keyIterations = 1000000;
    PrivateWallet.keyLength = 512;
    PrivateWallet.slt = 'salt';
    return PrivateWallet;
}(WalletBase_1.default));
exports.PrivateWallet = PrivateWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvUHJpdmF0ZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDM0MsSUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFDdEMsMkJBQXlCLGNBQ3pCLENBQUMsQ0FEc0M7QUFDdkMsMkJBQXVCLGNBQ3ZCLENBQUMsQ0FEb0M7QUFDckMsSUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFFMUIsSUFBTyxNQUFNLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFHbEM7SUFBNEIsaUNBQVU7SUFtRHBDLHVCQUFZLFVBQXFCO1FBQy9CLElBQUksZUFBZSxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkUsSUFBSSxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdELGtCQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMscUJBQXFCLEdBQUcsK0JBQStCLENBQUM7UUFDN0QsSUFBSSxDQUFDLHFCQUFxQixHQUFHLDhCQUE4QixDQUFDO1FBQzVELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQSxDQUFDO1lBQy9CLElBQUks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