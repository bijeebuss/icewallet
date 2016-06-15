"use strict";
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
var readline = require('readline');
var fs = require('fs');
var PrivateWallet = (function () {
    function PrivateWallet(seed) {
        this.pathToAddressesIndexes = './data/addressIndexes.json';
        this.transactionImportPath = './data/initialTransaction.dat';
        this.transactionExportPath = './data/signedTransaction.dat';
        var mnemonic = new Mnemonic(seed);
        this.masterHdPrivKey = mnemonic.toHDPrivateKey();
        this.accountHdPrivKey = this.masterHdPrivKey.derive("m/44'/0'/0'");
    }
    PrivateWallet.prototype.hdPrivateKey = function (index, change) {
        var chain = change ? 1 : 0;
        return this.accountHdPrivKey.derive(chain).derive(index);
    };
    PrivateWallet.prototype.address = function (index, change) {
        return this.hdPrivateKey(index, change).privateKey.toAddress().toString();
    };
    PrivateWallet.prototype.signTransaction = function (transaction) {
        transaction.sign(this.hdPrivateKey(0, false).privateKey);
    };
    PrivateWallet.prototype.addChangeAddress = function (transaction) {
        transaction.change(this.address(0, true));
    };
    PrivateWallet.prototype.addFee = function (transaction, fee) {
        transaction.fee(fee);
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
        fs.readFile(this.transactionImportPath, function (err, data) {
            if (err) {
                return callback(err, null);
            }
            var transaction = new bitcore.Transaction(data);
            _this.addChangeAddress(transaction);
            _this.addFee(transaction, fee);
            _this.signTransaction(transaction);
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
}());
exports.PrivateWallet = PrivateWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvUHJpdmF0ZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQzNDLElBQU8sUUFBUSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBRXRDLElBQU8sRUFBRSxXQUFXLElBQUksQ0FBQyxDQUFDO0FBRzFCO0lBUUUsdUJBQVksSUFBWTtRQUx4QiwyQkFBc0IsR0FBVSw0QkFBNEIsQ0FBQztRQUM3RCwwQkFBcUIsR0FBVSwrQkFBK0IsQ0FBQztRQUMvRCwwQkFBcUIsR0FBVSw4QkFBOEIsQ0FBQztRQUk1RCxJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVELG9DQUFZLEdBQVosVUFBYSxLQUFZLEVBQUUsTUFBYztRQUN2QyxJQUFJLEtBQUssR0FBVSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELCtCQUFPLEdBQVAsVUFBUSxLQUFZLEVBQUUsTUFBYztRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFD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