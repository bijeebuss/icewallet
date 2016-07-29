"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const cerialize_1 = require('cerialize');
var bitcore = require('bitcore-lib');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FsbGV0QWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvV2FsbGV0QWNjb3VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsNEJBQXVDLFdBQVcsQ0FBQyxDQUFBO0FBQ25ELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUVyQztJQVVFLE9BQWMsY0FBYyxDQUFDLFFBQWtCLEVBQUUsSUFBVTtRQUN6RCxRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEUsQ0FBQztBQUNILENBQUM7QUFUQztJQUFDLHFCQUFTO3FDQUFBO0FBQ1Y7SUFBQyxxQkFBUztxQ0FBQTtBQUNWO0lBQUMscUJBQVM7c0NBQUE7QUFDVjtJQUFDLHFCQUFTO2dEQUFBO0FBQ1Y7SUFBQyxxQkFBUztrREFBQTtBQVJDLGVBQU8sVUFhbkIsQ0FBQSJ9