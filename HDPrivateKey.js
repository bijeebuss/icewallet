"use strict";
var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
var HDPrivateKey = bitcore.HDPrivateKey;
var mnemonic = new Mnemonic('scheme caution cabin snack squeeze busy lava duck bleak cement medal endless');
var hdPrivateKey = mnemonic.toHDPrivateKey();
exports.hdPrivateKey = hdPrivateKey;
var addressKey = hdPrivateKey.derive("m/44'/0'/0'/0/0");
var address = addressKey.privateKey.toAddress();
var accountKey = hdPrivateKey.derive("m/44'/0'/0'");
exports.accountKey = accountKey;
var requestKey = hdPrivateKey.derive("m/1'/0");
var entropySource = bitcore.crypto.Hash.sha256(requestKey.privateKey.toBuffer()).toString('hex');
exports.entropySource = entropySource;
console.log("Address privateKey: " + addressKey.privateKey.toWIF());
console.log("Address: " + address.toString());
console.log("Master HDPrivateKey: " + hdPrivateKey.toString());
console.log("Master HDPublicKey: " + hdPrivateKey.hdPublicKey.toString());
console.log("Account HDPublicKey: " + accountKey.hdPublicKey.toString());
console.log("entropySource: " + entropySource);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSERQcml2YXRlS2V5LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9NaWNoYWVsL293bkNsb3VkL1NvdXJjZS9iaXRjb2luL0ljZVdhbGxldC8iLCJzb3VyY2VzIjpbIkhEUHJpdmF0ZUtleS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3BDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQzNDLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7QUFFeEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsOEVBQThFLENBQUMsQ0FBQztBQUM1RyxJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxFQUFFO0FBZXBDLG9CQUFZLGdCQWZ5QjtBQUM3QyxJQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDeEQsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNoRCxJQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQVk5QixrQkFBVSxjQVpvQjtBQUNuRCxJQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztBQVUvRCxxQkFBYSxpQkFWbUQ7QUFFakcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUN6RSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixHQUFHLGFBQWEsQ0FBQyxDQUFDO0FBR0MifQ==