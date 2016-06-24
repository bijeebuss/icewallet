"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
var readline = require('readline');
var WalletBase_1 = require('./WalletBase');
var fs = require('fs');
var async = require('async');
var PrivateWallet = (function (_super) {
    __extends(PrivateWallet, _super);
    function PrivateWallet(seed) {
        _super.call(this, (new Mnemonic(seed)).toHDPrivateKey().derive("m/44'/0'/0'").hdPublicKey.toString());
        this.pathToAddressesIndexes = './data/addressIndexes.json';
        this.transactionImportPath = './data/initialTransaction.dat';
        this.transactionExportPath = './data/signedTransaction.dat';
        this.walletHdPrivKey = (new Mnemonic(seed)).toHDPrivateKey();
        this.accountHdPrivKey = this.walletHdPrivKey.derive("m/44'/0'/0'");
    }
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
    PrivateWallet.prototype.deposit = function () {
        var _this = this;
        fs.readFile(this.pathToAddressesIndexes, 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            var addressesIndexes = JSON.parse(data);
            var newAddress = _this.address(addressesIndexes.external, false);
            console.log('Send coins to:' + newAddress);
            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question('Did the transaction complete? y/n\n', function (answer) {
                if (answer == 'y') {
                    console.log('good');
                    addressesIndexes.external += 1;
                    fs.writeFile(_this.pathToAddressesIndexes, JSON.stringify(addressesIndexes));
                }
                else if (answer == 'n') {
                    console.log('try again');
                }
                else {
                    console.log('answer either "y" or "n"');
                }
                rl.close();
            });
        });
    };
    PrivateWallet.prototype.processTransaction = function (transaction, fee, indexes) {
        var changePrivateKeys = this.privateKeyRange(0, indexes.change - 1, true);
        var externalPrivateKeys = this.privateKeyRange(0, indexes.external - 1, false);
        transaction
            .change(this.address(indexes.change, true))
            .fee(fee)
            .sign(externalPrivateKeys.concat(changePrivateKeys));
        transaction.serialize();
    };
    PrivateWallet.prototype.verifyTransaction = function (transaction, callback) {
        console.log('Please verify this transaction');
        console.log('Send: ' + bitcore.Unit.fromSatoshis(transaction._getOutputAmount() - transaction.getFee()).toBTC());
        console.log('To:   ' + transaction);
        console.log('Fee:  ' + bitcore.Unit.fromSatoshis(transaction.getFee()).toBTC());
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
        async.parallel([
            function (cb) { return fs.readFile(_this.transactionImportPath, 'utf8', cb); },
            function (cb) { return fs.readFile(_this.pathToAddressesIndexes, 'utf8', cb); }
        ], function (err, results) {
            if (err) {
                return callback(err, null);
            }
            var transaction = new bitcore.Transaction(JSON.parse(results[0]));
            var indexes = JSON.parse(results[1]);
            _this.processTransaction(transaction, fee, indexes);
            if (!transaction.isFullySigned()) {
                return callback('transaction is not fully signed, check yourself before you wreck yourself', transaction);
            }
            _this.verifyTransaction(transaction, function (err) {
                if (err) {
                    return callback(err, transaction);
                }
                fs.writeFile(_this.transactionExportPath, JSON.stringify(transaction.toObject()), function (err) {
                    if (err) {
                        return callback(err, transaction);
                    }
                    indexes.change += 1;
                    fs.writeFile(_this.pathToAddressesIndexes, JSON.stringify(indexes));
                    console.log('transaction successfully signed and written to ' + _this.transactionExportPath);
                    return callback(null, transaction);
                });
            });
        });
    };
    return PrivateWallet;
}(WalletBase_1.default));
exports.PrivateWallet = PrivateWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvUHJpdmF0ZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDM0MsSUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFFdEMsMkJBQXVCLGNBQ3ZCLENBQUMsQ0FEb0M7QUFDckMsSUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFDMUIsSUFBTyxLQUFLLFdBQVcsT0FBTyxDQUFDLENBQUM7QUFHaEM7SUFBNEIsaUNBQVU7SUFRcEMsdUJBQVksSUFBWTtRQUN0QixrQkFBTSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBTjVGLDJCQUFzQixHQUFVLDRCQUE0QixDQUFDO1FBQzdELDBCQUFxQixHQUFVLCtCQUErQixDQUFDO1FBQy9ELDBCQUFxQixHQUFVLDhCQUE4QixDQUFDO1FBSzVELElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzdELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsb0NBQVksR0FBWixVQUFhLEtBQVksRUFBRSxNQUFjO1FBQ3ZDLElBQUksS0FBSyxHQUFVLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENB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