"use strict";
var HdWalletInfo = (function () {
    function HdWalletInfo() {
        this.accounts = new Array();
    }
    return HdWalletInfo;
}());
exports.HdWalletInfo = HdWalletInfo;
var HdAccountInfo = (function () {
    function HdAccountInfo() {
        this.usedAddresses = new AddressIndexes();
    }
    return HdAccountInfo;
}());
exports.HdAccountInfo = HdAccountInfo;
var AddressIndexes = (function () {
    function AddressIndexes() {
    }
    return AddressIndexes;
}());
exports.AddressIndexes = AddressIndexes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkcmVzc0luZGV4ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL0FkZHJlc3NJbmRleGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtJQUlFO1FBQ0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEtBQUssRUFBaUIsQ0FBQztJQUM3QyxDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBUEQsSUFPQztBQVBZLG9CQUFZLGVBT3hCLENBQUE7QUFFRDtJQU1FO1FBQ0UsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUFURCxJQVNDO0FBVFkscUJBQWEsZ0JBU3pCLENBQUE7QUFFRDtJQUFBO0lBR0EsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFIWSxzQkFBYyxpQkFHMUIsQ0FBQSJ9