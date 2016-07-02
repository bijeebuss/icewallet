"use strict";
var PrivateWallet_1 = require("../src/Models/PrivateWallet");
var bitcore = require('bitcore-lib');
var seed = 'scheme caution cabin snack squeeze busy lava duck bleak cement medal endless';
var privateWallet = PrivateWallet_1.PrivateWallet.createNew('poop', './data/walletInfo.dat', false, seed, 9, 7);
privateWallet.exportInfo(function (err) {
    if (err) {
        throw err;
    }
    var privateWallet = PrivateWallet_1.PrivateWallet.loadFromInfo('poop', './data/walletInfo.dat', function (err, privateWallet) {
        if (err) {
            throw err;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3Qvd2FsbGV0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsOEJBQTRCLDZCQUE2QixDQUFDLENBQUE7QUFFMUQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBR3JDLElBQUksSUFBSSxHQUFHLDhFQUE4RSxDQUFDO0FBRzFGLElBQUksYUFBYSxHQUFHLDZCQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSx1QkFBdUIsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMvRixhQUFhLENBQUMsVUFBVSxDQUFDLFVBQUMsR0FBRztJQUMzQixFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO1FBQ04sTUFBTSxHQUFHLENBQUM7SUFDWixDQUFDO0lBQ0QsSUFBSSxhQUFhLEdBQUcsNkJBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFDLHVCQUF1QixFQUFFLFVBQUMsR0FBRyxFQUFDLGFBQWE7UUFDL0YsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztZQUNOLE1BQU0sR0FBRyxDQUFDO1FBQ1osQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUEifQ==