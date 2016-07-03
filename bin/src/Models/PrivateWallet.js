"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
var CryptoService_1 = require('../Services/CryptoService');
var readline = require('readline');
var WalletInfo_1 = require('./WalletInfo');
var WalletService_1 = require('./WalletService');
var fs = require('fs');
var async = require('async');
var PrivateWalletService = (function (_super) {
    __extends(PrivateWalletService, _super);
    function PrivateWalletService(walletInfo, password, pathToInfo) {
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
    PrivateWalletService.loadFromInfo = function (password, path, callback) {
        var _this = this;
        fs.readFile(path, 'hex', function (err, data) {
            if (err) {
                return callback(err, null);
            }
            _this.cryptoService.decrypt(password, data, function (err, decrypted) {
                if (err) {
                    return callback(err, null);
                }
                var walletInfo = JSON.parse(decrypted);
                if (walletInfo.seed == null) {
                    PrivateWalletService.verifySeed(walletInfo, function (err, matched) {
                        if (err) {
                            return callback(err, null);
                        }
                        var wallet = new PrivateWalletService(walletInfo, password, path);
                        return callback(null, wallet);
                    });
                }
                else {
                    var wallet = new PrivateWalletService(walletInfo, password, path);
                    return callback(null, wallet);
                }
            });
        });
    };
    PrivateWalletService.verifySeed = function (info, callback) {
        var _this = this;
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('the seed is not stored here please enter it now to open the wallet\n', function (seed) {
            rl.close();
            _this.cryptoService.verifyHash(info.seedHash, seed, function (err, matched) {
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
    PrivateWalletService.createNew = function (password, exportPath, exportSeed, seed, externalIndex, changeIndex) {
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
        var wallet = new PrivateWalletService(info, password, exportPath);
        wallet.password = password;
        wallet.pathToInfo = exportPath;
        return wallet;
    };
    PrivateWalletService.prototype.hdPrivateKey = function (index, change) {
        var chain = change ? 1 : 0;
        return this.accountHdPrivKey.derive(chain).derive(index);
    };
    PrivateWalletService.prototype.privateKeyRange = function (start, end, change) {
        var keys = [];
        for (var i = start; i <= end; i++) {
            keys.push(this.hdPrivateKey(i, change).privateKey.toString());
        }
        return keys;
    };
    PrivateWalletService.prototype.exportInfo = function (callback) {
        var _this = this;
        async.parallel({
            cryptoKey: function (cb) { return PrivateWalletService.cryptoService.deriveKey(_this.password, cb); },
            seedHash: function (cb) {
                if (_this.walletInfo.seedHash || _this.walletInfo.exportSeed) {
                    return cb(null);
                }
                else {
                    PrivateWalletService.cryptoService.hash(_this.walletInfo.seed, function (err, hash) {
                        if (err) {
                            return cb(err);
                        }
                        _this.walletInfo.seedHash = hash;
                        return cb(null, hash);
                    });
                }
            }
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            var exportInfo = new WalletInfo_1.WalletInfo();
            exportInfo.exportSeed = _this.walletInfo.exportSeed;
            exportInfo.seedHash = _this.walletInfo.seedHash;
            exportInfo.seed = _this.walletInfo.exportSeed ? _this.walletInfo.seed : null;
            exportInfo.nextUnusedAddresses.change = _this.walletInfo.nextUnusedAddresses.change;
            exportInfo.nextUnusedAddresses.external = _this.walletInfo.nextUnusedAddresses.external;
            var encrypted = PrivateWalletService.cryptoService.encrypt(results['cryptoKey'], JSON.stringify(exportInfo));
            fs.writeFile(_this.pathToInfo, new Buffer(encrypted, 'hex'), function (err) {
                if (err) {
                    return callback(err);
                }
                return callback(null);
            });
        });
    };
    PrivateWalletService.prototype.deposit = function () {
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
    PrivateWalletService.prototype.processTransaction = function (transaction, fee) {
        var indexes = this.walletInfo.nextUnusedAddresses;
        var changePrivateKeys = this.privateKeyRange(0, indexes.change - 1, true);
        var externalPrivateKeys = this.privateKeyRange(0, indexes.external - 1, false);
        transaction
            .change(this.address(indexes.change, true))
            .fee(fee)
            .sign(externalPrivateKeys.concat(changePrivateKeys));
        transaction.serialize();
    };
    PrivateWalletService.prototype.verifyTransaction = function (transaction, fee, callback) {
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
    PrivateWalletService.prototype.completeTransaction = function (fee, callback) {
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
    PrivateWalletService.cryptoService = new CryptoService_1.default();
    return PrivateWalletService;
}(WalletService_1.default));
exports.PrivateWalletService = PrivateWalletService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvUHJpdmF0ZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDM0MsOEJBQTBCLDJCQUMxQixDQUFDLENBRG9EO0FBQ3JELElBQU8sUUFBUSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBQ3RDLDJCQUF5QixjQUN6QixDQUFDLENBRHNDO0FBQ3ZDLDhCQUEwQixpQkFDMUIsQ0FBQyxDQUQwQztBQUMzQyxJQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztBQUMxQixJQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQztBQUVoQztJQUFtQyx3Q0FBYTtJQTRFOUMsOEJBQVksVUFBcUIsRUFBRSxRQUFlLEVBQUUsVUFBaUI7UUFDbkUsSUFBSSxlQUFlLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2RSxJQUFJLGdCQUFnQixHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0Qsa0JBQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDdkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLElBQUksQ0FBQyxxQkFBcUIsR0FBRywrQkFBK0IsQ0FBQztRQUM3RCxJQUFJLENBQUMscUJBQXFCLEdBQUcsOEJBQThCLENBQUM7UUFDNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FB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