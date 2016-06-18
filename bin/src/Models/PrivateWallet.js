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
var PrivateWallet = (function (_super) {
    __extends(PrivateWallet, _super);
    function PrivateWallet(seed) {
        _super.call(this, (new Mnemonic(seed)).toHDPrivateKey().hdPublicKey.toString());
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
    PrivateWallet.prototype.completeTransaction = function (transaction, fee, indexes) {
        var changePrivateKeys = this.privateKeyRange(0, indexes.change - 1, true);
        var externalPrivateKeys = this.privateKeyRange(0, indexes.external - 1, false);
        transaction
            .change(this.address(indexes.change, true))
            .fee(fee)
            .sign(externalPrivateKeys.concat(changePrivateKeys));
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
    PrivateWallet.prototype.withdraw = function (fee, callback) {
        var _this = this;
        async.parallel([
            function (cb) { return fs.readFile(_this.transactionImportPath, 'utf8', cb); },
            function (cb) { return fs.readFile(_this.pathToAddressesIndexes, 'utf8', cb); }
        ], function (err, results) {
            if (err) {
                return callback(err, null);
            }
            var transaction = new bitcore.Transaction(results[0]);
            var indexes = JSON.parse(results[1]);
            _this.completeTransaction(transaction, fee, indexes);
            fs.writeFile(_this.transactionExportPath, transaction.serialize(), function (err) {
                if (err) {
                    return callback(err, transaction);
                }
                console.log('transaction successfull signed and written to ' + _this.transactionExportPath);
                return callback(null, transaction);
            });
        });
    };
    return PrivateWallet;
}(WalletBase_1.default));
exports.PrivateWallet = PrivateWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvUHJpdmF0ZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDM0MsSUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFFdEMsMkJBQXVCLGNBQ3ZCLENBQUMsQ0FEb0M7QUFDckMsSUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFHMUI7SUFBNEIsaUNBQVU7SUFRcEMsdUJBQVksSUFBWTtRQUN0QixrQkFBTSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFOdEUsMkJBQXNCLEdBQVUsNEJBQTRCLENBQUM7UUFDN0QsMEJBQXFCLEdBQVUsK0JBQStCLENBQUM7UUFDL0QsMEJBQXFCLEdBQVUsOEJBQThCLENBQUM7UUFLNUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDN0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCxvQ0FBWSxHQUFaLFVBQWEsS0FBWSxFQUFFLE1BQWM7UUFDdkMsSUFBSSxLQUFLLEdBQVUsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNELENB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