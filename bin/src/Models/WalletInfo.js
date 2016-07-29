"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var bitcore = require('bitcore-lib');
const cerialize_1 = require('cerialize');
class WalletInfo {
    addAccount(xpub, name, index, nextChangeIndex, nextExternalIndex) {
        this.accounts.push({});
    }
}
__decorate([
    cerialize_1.serialize
], WalletInfo.prototype, "accounts", void 0);
exports.WalletInfo = WalletInfo;
class Account {
    static OnDeserialized(instance, json) {
        instance.hdPublicKey = new bitcore.HDPublicKey(instance.xpub);
    }
}
__decorate([
    cerialize_1.serialize
], Account.prototype, "xpub", void 0);
__decorate([
    cerialize_1.serialize
], Account.prototype, "name", void 0);
__decorate([
    cerialize_1.serialize
], Account.prototype, "index", void 0);
__decorate([
    cerialize_1.serialize
], Account.prototype, "nextChangeIndex", void 0);
__decorate([
    cerialize_1.serialize
], Account.prototype, "nextExternalIndex", void 0);
exports.Account = Account;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FsbGV0SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvV2FsbGV0SW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLDRCQUF1QyxXQUFXLENBQUMsQ0FBQTtBQUVuRDtJQUlTLFVBQVUsQ0FBQyxJQUFXLEVBQUUsSUFBVyxFQUFFLEtBQVksRUFBRSxlQUFzQixFQUFFLGlCQUF3QjtRQUN4RyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUVsQixDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQVJDO0lBQUMscUJBQVM7NENBQUE7QUFEQyxrQkFBVSxhQVN0QixDQUFBO0FBRUQ7SUFVRSxPQUFjLGNBQWMsQ0FBQyxRQUFrQixFQUFFLElBQVU7UUFDekQsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7QUFDSCxDQUFDO0FBVEM7SUFBQyxxQkFBUztxQ0FBQTtBQUNWO0lBQUMscUJBQVM7cUNBQUE7QUFDVjtJQUFDLHFCQUFTO3NDQUFBO0FBQ1Y7SUFBQyxxQkFBUztnREFBQTtBQUNWO0lBQUMscUJBQVM7a0RBQUE7QUFSQyxlQUFPLFVBYW5CLENBQUEifQ==