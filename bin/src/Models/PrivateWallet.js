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
var async = require('async');
var crypto = require('crypto');
var scrypt = require('scrypt');
var PrivateWallet = (function (_super) {
    __extends(PrivateWallet, _super);
    function PrivateWallet(walletInfo, password, pathToInfo) {
        var walletHdPrivKey = (new Mnemonic(walletInfo.seed)).toHDPrivateKey();
        var accountHdPrivKey = walletHdPrivKey.derive("m/44'/0'/0'");
        _super.call(this, accountHdPrivKey.hdPublicKey.toString());
        this.walletHdPrivKey = walletHdPrivKey;
        this.accountHdPrivKey = accountHdPrivKey;
        this.transactionImportPath = './data/initialTransaction.dat';
        this.transactionExportPath = './data/signedTransaction.dat';
        this.walletInfo = walletInfo;
        this.password = password;
        this.pathToInfo = pathToInfo;
    }
    PrivateWallet.loadFromInfo = function (password, path, callback) {
        fs.readFile(path, 'hex', function (err, data) {
            if (err) {
                return callback(err, null);
            }
            crypto.pbkdf2(password, PrivateWallet.slt, PrivateWallet.keyIterations, PrivateWallet.keyLength, PrivateWallet.keyDigest, function (err, key) {
                if (err) {
                    return callback(err, null);
                }
                var decipher = crypto.createDecipher(PrivateWallet.cryptoAlgorithm, key.toString('hex'));
                var dec = decipher.update(data, 'hex', 'utf8');
                dec += decipher.final('utf8');
                var walletInfo = JSON.parse(dec);
                if (walletInfo.seed == null) {
                    PrivateWallet.verifySeed(walletInfo, function (err, matched) {
                        if (err) {
                            return callback(err, null);
                        }
                        var wallet = new PrivateWallet(walletInfo, password, path);
                        return callback(null, wallet);
                    });
                }
                else {
                    var wallet = new PrivateWallet(walletInfo, password, path);
                    return callback(null, wallet);
                }
            });
        });
    };
    PrivateWallet.verifySeed = function (info, callback) {
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('the seed is not stored here please enter it now to open the wallet\n', function (seed) {
            rl.close();
            scrypt.verifyKdf(new Buffer(info.seedHash, 'base64'), new Buffer(seed), function (err, matched) {
                if (err) {
                    return callback(err, false);
                }
                if (!matched) {
                    return callback('seed entered does not match hash', false);
                }
                info.seed = seed;
                return callback(null, true);
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
        var wallet = new PrivateWallet(info, password, exportPath);
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
        async.parallel({
            cryptoKey: function (cb) {
                crypto.pbkdf2(_this.password, PrivateWallet.slt, PrivateWallet.keyIterations, PrivateWallet.keyLength, PrivateWallet.keyDigest, function (err, key) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, key.toString('hex'));
                });
            },
            seedHash: function (cb) {
                if (_this.walletInfo.exportSeed) {
                    return cb(null);
                }
                else {
                    var params = scrypt.paramsSync(10);
                    scrypt.kdf(_this.walletInfo.seed, params, function (err, hash) {
                        if (err) {
                            return cb(err);
                        }
                        _this.walletInfo.seedHash = hash.toString('base64');
                        return cb(null);
                    });
                }
            }
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            if (!_this.walletInfo.exportSeed) {
                _this.walletInfo.seed = null;
            }
            var cipher = crypto.createCipher(PrivateWallet.cryptoAlgorithm, results['cryptoKey']);
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
    PrivateWallet.keyIterations = 100000;
    PrivateWallet.keyLength = 512;
    PrivateWallet.slt = 'salt';
    return PrivateWallet;
}(WalletBase_1.default));
exports.PrivateWallet = PrivateWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvUHJpdmF0ZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDM0MsSUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFDdEMsMkJBQXlCLGNBQ3pCLENBQUMsQ0FEc0M7QUFDdkMsMkJBQXVCLGNBQ3ZCLENBQUMsQ0FEb0M7QUFDckMsSUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFDMUIsSUFBTyxLQUFLLFdBQVcsT0FBTyxDQUFDLENBQUM7QUFDaEMsSUFBTyxNQUFNLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFDbEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRS9CO0lBQTRCLGlDQUFVO0lBa0ZwQyx1QkFBWSxVQUFxQixFQUFFLFFBQWUsRUFBRSxVQUFpQjtRQUNuRSxJQUFJLGVBQWUsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZFLElBQUksZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3RCxrQkFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLCtCQUErQixDQUFDO1FBQzdELElBQUksQ0FBQyxxQkFBcUIsR0FBRyw4QkFBOEIsQ0FBQztRQUM1RCxJQUFJ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