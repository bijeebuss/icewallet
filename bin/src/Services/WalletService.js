"use strict";
var bitcore = require('bitcore-lib');
const CryptoService_1 = require('../Services/CryptoService');
class WalletService {
    constructor(info, password) {
        this.walletInfo = info;
        this.password = password;
    }
    get hdPublicKey() {
        return this.selectedAccount.hdPublicKey;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FsbGV0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TZXJ2aWNlcy9XYWxsZXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsZ0NBQTBCLDJCQUMxQixDQUFDLENBRG9EO0FBS3JEO0lBVUUsWUFBWSxJQUF5QyxFQUFFLFFBQWU7UUFDcEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDM0IsQ0FBQztJQVBELElBQUksV0FBVztRQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQztJQUM1QyxDQUFDO0lBUUQsT0FBTyxDQUFDLEtBQVksRUFBRSxNQUFjO1FBQ2xDLElBQUksS0FBSyxHQUFVLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2hHLENBQUM7SUFFRCxZQUFZLENBQUMsS0FBWSxFQUFFLEdBQVUsRUFBRSxNQUFjO1FBQ25ELElBQUksU0FBUyxHQUFZLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBVSxLQUFLLEVBQUUsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBQyxDQUFDO1lBQ3hDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNuQixDQUFDO0FBSUgsQ0FBQztBQTNCUSwyQkFBYSxHQUFHLElBQUksdUJBQWEsRUFBRSxDQTJCM0M7QUFFRDtrQkFBZSxhQUFhLENBQUMifQ==