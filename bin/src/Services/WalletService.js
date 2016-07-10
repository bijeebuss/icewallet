"use strict";
var bitcore = require('bitcore-lib');
const CryptoService_1 = require('../Services/CryptoService');
class WalletService {
    constructor(publicKey, password) {
        this.hdPublicKey = new bitcore.HDPublicKey(publicKey);
        this.password = password;
    }
    address(index, change) {
        var chain = change ? 1 : 0;
        return new bitcore.Address(this.hdPublicKey.derive(chain).derive(index).publicKey).toString();
    }
    addressRange(start, end, change) {
        var addresses = [];
        for (var i = start; i <= end; i++) {
            addresses.push(this.address(i, change));
        }
        return addresses;
    }
}
WalletService.cryptoService = new CryptoService_1.default();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WalletService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FsbGV0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TZXJ2aWNlcy9XYWxsZXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsZ0NBQTBCLDJCQUUxQixDQUFDLENBRm9EO0FBRXJEO0lBS0UsWUFBWSxTQUFpQixFQUFFLFFBQWU7UUFDNUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDM0IsQ0FBQztJQUdELE9BQU8sQ0FBQyxLQUFZLEVBQUUsTUFBYztRQUNsQyxJQUFJLEtBQUssR0FBVSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNoRyxDQUFDO0lBRUQsWUFBWSxDQUFDLEtBQVksRUFBRSxHQUFVLEVBQUUsTUFBYztRQUNuRCxJQUFJLFNBQVMsR0FBWSxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVUsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQztZQUN4QyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDbkIsQ0FBQztBQUdILENBQUM7QUF0QlEsMkJBQWEsR0FBRyxJQUFJLHVCQUFhLEVBQUUsQ0FzQjNDO0FBRUQ7a0JBQWUsYUFBYSxDQUFDIn0=