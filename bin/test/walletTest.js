"use strict";
var PrivateWallet_1 = require("../src/Models/PrivateWallet");
var bitcore = require('bitcore-lib');
var seed = 'scheme caution cabin snack squeeze busy lava duck bleak cement medal endless';
var privateWallet = PrivateWallet_1.PrivateWallet.loadFromInfo('poop', './data/walletInfo.dat', function (err, privateWallet) {
    if (err) {
        throw err;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3Qvd2FsbGV0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsOEJBQTRCLDZCQUE2QixDQUFDLENBQUE7QUFFMUQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBR3JDLElBQUksSUFBSSxHQUFHLDhFQUE4RSxDQUFDO0FBVzFGLElBQUksYUFBYSxHQUFHLDZCQUFhLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBQyx1QkFBdUIsRUFBRSxVQUFDLEdBQUcsRUFBQyxhQUFhO0lBQy9GLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7UUFDTixNQUFNLEdBQUcsQ0FBQztJQUNaLENBQUM7QUFDSCxDQUFDLENBQUMsQ0FBQyJ9