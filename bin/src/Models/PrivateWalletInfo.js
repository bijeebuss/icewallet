"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const cerialize_1 = require('cerialize');
const Account_1 = require('./Account');
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
class PrivateWalletInfo {
    constructor(seed, exportSeed) {
        this.seed = seed;
        this.exportSeed = exportSeed;
        this.accounts = [];
    }
    addAccount(name, index, nextChangeIndex, nextExternalIndex) {
        var hdPublicKey = (new Mnemonic(this.seed)).toHDPrivateKey().derive("m/44'/0'").derive(index, true).hdPublicKey;
        var account = new Account_1.Account();
        account.xpub = hdPublicKey.toString(),
            account.name = name,
            account.index = index,
            account.nextChangeIndex = nextChangeIndex,
            account.nextExternalIndex = nextExternalIndex,
            account.hdPublicKey = hdPublicKey,
            this.accounts.push(account);
    }
    static OnSerialized(instance, json) {
        json['seed'] = instance.exportSeed ? instance.seed : null;
    }
}
__decorate([
    cerialize_1.deserialize
], PrivateWalletInfo.prototype, "seed", void 0);
__decorate([
    cerialize_1.autoserialize
], PrivateWalletInfo.prototype, "exportSeed", void 0);
__decorate([
    cerialize_1.autoserialize
], PrivateWalletInfo.prototype, "seedHash", void 0);
__decorate([
    cerialize_1.autoserializeAs(Account_1.Account)
], PrivateWalletInfo.prototype, "accounts", void 0);
exports.PrivateWalletInfo = PrivateWalletInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVdhbGxldEluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL1ByaXZhdGVXYWxsZXRJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSw0QkFBNEQsV0FBVyxDQUFDLENBQUE7QUFDeEUsMEJBQXNCLFdBQ3RCLENBQUMsQ0FEZ0M7QUFDakMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRTNDO0lBUUUsWUFBYSxJQUFXLEVBQUUsVUFBa0I7UUFDMUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVNLFVBQVUsQ0FBQyxJQUFXLEVBQUUsS0FBWSxFQUFFLGVBQXNCLEVBQUUsaUJBQXdCO1FBQzNGLElBQUksV0FBVyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFBO1FBQzlHLElBQUksT0FBTyxHQUFHLElBQUksaUJBQU8sRUFBRSxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUNyQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUk7WUFDbkIsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLO1lBQ3JCLE9BQU8sQ0FBQyxlQUFlLEdBQUcsZUFBZTtZQUN6QyxPQUFPLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCO1lBQzdDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsV0FBVztZQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBR0QsT0FBYyxZQUFZLENBQUMsUUFBNEIsRUFBRSxJQUFVO1FBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQzVELENBQUM7QUFDSCxDQUFDO0FBNUJDO0lBQUMsdUJBQVc7K0NBQUE7QUFFWjtJQUFDLHlCQUFhO3FEQUFBO0FBQ2Q7SUFBQyx5QkFBYTttREFBQTtBQUNkO0lBQUMsMkJBQWUsQ0FBQyxpQkFBTyxDQUFDO21EQUFBO0FBTmQseUJBQWlCLG9CQThCN0IsQ0FBQSJ9