"use strict";
var bitcore = require('bitcore-lib');
const CryptoService_1 = require('../Services/CryptoService');
class WalletService {
    constructor(info, password) {
        this.walletInfo = info;
        this.password = password;
    }
    switchAccount(accountName) {
        this.selectedAccount = this.walletInfo.accounts.find(account => account.name == accountName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FsbGV0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TZXJ2aWNlcy9XYWxsZXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsZ0NBQTBCLDJCQUMxQixDQUFDLENBRG9EO0FBS3JEO0lBY0UsWUFBWSxJQUF5QyxFQUFFLFFBQWU7UUFDcEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDM0IsQ0FBQztJQVhELGFBQWEsQ0FBQyxXQUFrQjtRQUM5QixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDO0lBQzVDLENBQUM7SUFRRCxPQUFPLENBQUMsS0FBWSxFQUFFLE1BQWM7UUFDbEMsSUFBSSxLQUFLLEdBQVUsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDaEcsQ0FBQztJQUVELFlBQVksQ0FBQyxLQUFZLEVBQUUsR0FBVSxFQUFFLE1BQWM7UUFDbkQsSUFBSSxTQUFTLEdBQVksRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFVLEtBQUssRUFBRSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUM7WUFDeEMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ25CLENBQUM7QUFHSCxDQUFDO0FBOUJRLDJCQUFhLEdBQUcsSUFBSSx1QkFBYSxFQUFFLENBOEIzQztBQUVEO2tCQUFlLGFBQWEsQ0FBQyJ9