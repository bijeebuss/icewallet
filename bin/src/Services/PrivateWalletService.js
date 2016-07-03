"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
var CryptoService_1 = require('../Services/CryptoService');
var WalletInfo_1 = require('../Models/WalletInfo');
var TransactionInfo_1 = require('../Models/TransactionInfo');
var WalletService_1 = require('./WalletService');
var async = require('async');
var PrivateWalletService = (function (_super) {
    __extends(PrivateWalletService, _super);
    function PrivateWalletService(walletInfo, password) {
        if (!walletInfo.seed) {
            walletInfo.seed = new Mnemonic().toString();
        }
        var walletHdPrivKey = (new Mnemonic(walletInfo.seed)).toHDPrivateKey();
        var accountHdPrivKey = walletHdPrivKey.derive("m/44'/0'/0'");
        _super.call(this, accountHdPrivKey.hdPublicKey.toString());
        this.walletHdPrivKey = walletHdPrivKey;
        this.accountHdPrivKey = accountHdPrivKey;
        this.walletInfo = walletInfo;
        this.password = password;
    }
    PrivateWalletService.openWallet = function (password, encryptedInfo, callback) {
        this.cryptoService.decrypt(password, encryptedInfo, function (err, decrypted) {
            if (err) {
                return callback(err, null, null);
            }
            var walletInfo = JSON.parse(decrypted);
            if (walletInfo.seed == null) {
                return callback('SEED_MISSING', walletInfo, null);
            }
            else {
                var wallet = new PrivateWalletService(walletInfo, password);
                return callback(null, walletInfo, wallet);
            }
        });
    };
    PrivateWalletService.seedWallet = function (password, info, seed, callback) {
        this.cryptoService.verifyHash(info.seedHash, seed, function (err, matched) {
            if (err) {
                return callback(err, null);
            }
            if (!matched) {
                return callback('seed entered does not match hash', null);
            }
            info.seed = seed;
            var wallet = new PrivateWalletService(info, password);
            return callback(null, wallet);
        });
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
    PrivateWalletService.prototype.getDepositAddress = function () {
        return this.address(this.walletInfo.nextUnusedAddresses.external, false);
    };
    PrivateWalletService.prototype.incrementChangeIndex = function () {
        this.walletInfo.nextUnusedAddresses.change += 1;
    };
    PrivateWalletService.prototype.incrementExternalIndex = function () {
        this.walletInfo.nextUnusedAddresses.external += 1;
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
                return callback(err, null);
            }
            var exportInfo = new WalletInfo_1.WalletInfo();
            exportInfo.exportSeed = _this.walletInfo.exportSeed;
            exportInfo.seedHash = _this.walletInfo.seedHash;
            exportInfo.seed = _this.walletInfo.exportSeed ? _this.walletInfo.seed : null;
            exportInfo.nextUnusedAddresses.change = _this.walletInfo.nextUnusedAddresses.change;
            exportInfo.nextUnusedAddresses.external = _this.walletInfo.nextUnusedAddresses.external;
            var encrypted = PrivateWalletService.cryptoService.encrypt(results['cryptoKey'], JSON.stringify(exportInfo));
            return callback(null, encrypted);
        });
    };
    PrivateWalletService.prototype.parseTransaction = function (serializedTransaction) {
        var transaction = new bitcore.Transaction(JSON.parse(serializedTransaction));
        var info = new TransactionInfo_1.default();
        info.outputsBTC = {};
        transaction.outputs.forEach(function (output) {
            info.outputsBTC[output._script.toAddress().toString()] = bitcore.Unit.fromSatoshis(output._satoshis).toBTC();
        });
        return info;
    };
    PrivateWalletService.prototype.completeTransaction = function (serializedTransaction, fee) {
        var transaction = new bitcore.Transaction(JSON.parse(serializedTransaction));
        var indexes = this.walletInfo.nextUnusedAddresses;
        var changePrivateKeys = this.privateKeyRange(0, indexes.change - 1, true);
        var externalPrivateKeys = this.privateKeyRange(0, indexes.external - 1, false);
        transaction
            .change(this.address(indexes.change, true))
            .fee(fee)
            .sign(externalPrivateKeys.concat(changePrivateKeys));
        transaction.serialize();
        if (!transaction.isFullySigned()) {
            throw 'transaction is not fully signed, check yourself before you wreck yourself';
        }
        return JSON.stringify(transaction.toObject());
    };
    PrivateWalletService.cryptoService = new CryptoService_1.default();
    return PrivateWalletService;
}(WalletService_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PrivateWalletService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvU2VydmljZXMvUHJpdmF0ZVdhbGxldFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQzNDLDhCQUEwQiwyQkFFMUIsQ0FBQyxDQUZvRDtBQUVyRCwyQkFBeUIsc0JBQ3pCLENBQUMsQ0FEOEM7QUFDL0MsZ0NBQTRCLDJCQUM1QixDQUFDLENBRHNEO0FBQ3ZELDhCQUEwQixpQkFDMUIsQ0FBQyxDQUQwQztBQUMzQyxJQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQztBQUVoQztJQUFrRCx3Q0FBYTtJQXVDN0QsOEJBQVksVUFBcUIsRUFBRSxRQUFlO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7WUFDcEIsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlDLENBQUM7UUFDRCxJQUFJLGVBQWUsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZFLElBQUksZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3RCxrQkFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxD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