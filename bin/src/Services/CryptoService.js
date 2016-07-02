"use strict";
var crypto = require('crypto');
var scrypt = require('scrypt');
var cryptoService = (function () {
    function cryptoService() {
        this.cryptoAlgorithm = 'aes-256-ctr';
        this.keyLength = 512;
        this.slt = 'A55F3D3A-7204-4582-906A-1EC928F79262';
    }
    cryptoService.prototype.deriveKey = function (password, callback) {
        scrypt.hash(password, { "N": 16, "r": 1, "p": 1 }, this.keyLength, this.slt, function (err, hash) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, hash.toString('hex'));
        });
    };
    cryptoService.prototype.decrypt = function (password, encrypted, callback) {
        var _this = this;
        this.deriveKey(password, function (err, key) {
            var decipher = crypto.createDecipher(_this.cryptoAlgorithm, key);
            var decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return callback(null, decrypted);
        });
    };
    cryptoService.prototype.encrypt = function (key, data) {
        var cipher = crypto.createCipher(this.cryptoAlgorithm, key);
        var encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    };
    cryptoService.prototype.hash = function (secret, callback) {
        var params = scrypt.paramsSync(10, 750000000, 0.5);
        scrypt.kdf(secret, params, function (err, hash) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, hash.toString('hex'));
        });
    };
    cryptoService.prototype.verifyHash = function (hash, secret, callback) {
        scrypt.verifyKdf(new Buffer(hash, 'hex'), new Buffer(secret), callback);
    };
    return cryptoService;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = cryptoService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3J5cHRvU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TZXJ2aWNlcy9DcnlwdG9TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLE1BQU0sV0FBVyxRQUFRLENBQUMsQ0FBQztBQUNsQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFL0I7SUFBQTtRQUNFLG9CQUFlLEdBQUcsYUFBYSxDQUFDO1FBQ2hDLGNBQVMsR0FBRyxHQUFHLENBQUM7UUFDaEIsUUFBRyxHQUFHLHNDQUFzQyxDQUFDO0lBd0MvQyxDQUFDO0lBdENDLGlDQUFTLEdBQVQsVUFBVSxRQUFlLEVBQUUsUUFBa0M7UUFDM0QsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxVQUFDLEdBQUcsRUFBRSxJQUFJO1lBQzlFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCwrQkFBTyxHQUFQLFVBQVEsUUFBZSxFQUFFLFNBQWdCLEVBQUUsUUFBd0M7UUFBbkYsaUJBT0M7UUFOQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxVQUFDLEdBQUcsRUFBRSxHQUFHO1lBQ2hDLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxDQUFDLGVBQWUsRUFBQyxHQUFHLENBQUMsQ0FBQztZQUMvRCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBQyxLQUFLLEVBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEQsU0FBUyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsK0JBQU8sR0FBUCxVQUFRLEdBQVUsRUFBRSxJQUFXO1FBQzdCLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBQyxHQUFHLENBQUMsQ0FBQztRQUMzRCxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLENBQUE7UUFDaEQsU0FBUyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRUQsNEJBQUksR0FBSixVQUFLLE1BQWEsRUFBRSxRQUFtQztRQUNyRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQUMsR0FBRyxFQUFFLElBQUk7WUFDbkMsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztnQkFDTixNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELGtDQUFVLEdBQVYsVUFBVyxJQUFXLEVBQUUsTUFBYSxFQUFFLFFBQTZCO1FBQ2xFLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUEzQ0QsSUEyQ0M7QUEzQ0Q7K0JBMkNDLENBQUEifQ==