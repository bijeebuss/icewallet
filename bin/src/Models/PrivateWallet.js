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
    PrivateWallet.prototype.processTransaction = function (transaction, fee, indexes) {
        var changePrivateKeys = this.privateKeyRange(0, indexes.change - 1, true);
        var externalPrivateKeys = this.privateKeyRange(0, indexes.external - 1, false);
        transaction
            .change(this.address(indexes.change, true))
            .fee(fee)
            .sign(externalPrivateKeys.concat(changePrivateKeys));
        transaction.serialize();
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
    };
    return PrivateWallet;
}(WalletBase_1.default));
exports.PrivateWallet = PrivateWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvUHJpdmF0ZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDM0MsSUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFFdEMsMkJBQXVCLGNBQ3ZCLENBQUMsQ0FEb0M7QUFDckMsSUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFDMUIsSUFBTyxLQUFLLFdBQVcsT0FBTyxDQUFDLENBQUM7QUFHaEM7SUFBNEIsaUNBQVU7SUFRcEMsdUJBQVksSUFBWTtRQUN0QixrQkFBTSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBTjVGLDJCQUFzQixHQUFVLDRCQUE0QixDQUFDO1FBQzdELDBCQUFxQixHQUFVLCtCQUErQixDQUFDO1FBQy9ELDBCQUFxQixHQUFVLDhCQUE4QixDQUFDO1FBSzVELElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzdELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsb0NBQVksR0FBWixVQUFhLEtBQVksRUFBRSxNQUFjO1FBQ3ZDLElBQUksS0FBSyxHQUFVLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENB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