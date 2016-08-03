"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var bitcore = require('bitcore-lib');
const cerialize_1 = require('cerialize');
const Account_1 = require('./Account');
class PublicWalletInfo {
    constructor() {
        this.accounts = [];
    }
    addAccount(xpub, name) {
        var account = new Account_1.Account();
        account.xpub = xpub;
        account.name = name;
        account.hdPublicKey = new bitcore.HDPublicKey(xpub);
        this.accounts.push(account);
    }
}
__decorate([
    cerialize_1.autoserializeAs(Account_1.Account)
], PublicWalletInfo.prototype, "accounts", void 0);
exports.PublicWalletInfo = PublicWalletInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljV2FsbGV0SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvUHVibGljV2FsbGV0SW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLDRCQUE4QixXQUFXLENBQUMsQ0FBQTtBQUMxQywwQkFBc0IsV0FFdEIsQ0FBQyxDQUZnQztBQUVqQztJQUFBO1FBR1MsYUFBUSxHQUFhLEVBQUUsQ0FBQTtJQVdoQyxDQUFDO0lBUlEsVUFBVSxDQUFDLElBQVcsRUFBRSxJQUFXO1FBRXhDLElBQUksT0FBTyxHQUFHLElBQUksaUJBQU8sRUFBRSxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLENBQUM7QUFDSCxDQUFDO0FBWkM7SUFBQywyQkFBZSxDQUFDLGlCQUFPLENBQUM7a0RBQUE7QUFGZCx3QkFBZ0IsbUJBYzVCLENBQUEifQ==