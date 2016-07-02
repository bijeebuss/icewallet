import crypto = require('crypto');
let scrypt = require('scrypt');

export default class cryptoService {
  cryptoAlgorithm = 'aes-256-ctr';
  keyLength = 512;
  slt = 'A55F3D3A-7204-4582-906A-1EC928F79262';

  deriveKey(password:string, callback:(err, key:string) => void){
    scrypt.hash(password, {"N":16,"r":1,"p":1}, this.keyLength, this.slt, (err, hash) => {
      if (err){
        return callback(err,null);
      }
      return callback(null, hash.toString('hex'));
    });
  }

  decrypt(password:string, encrypted:string, callback:(err, decrypted:string) => void){
    this.deriveKey(password, (err, key) => {
      var decipher = crypto.createDecipher(this.cryptoAlgorithm,key);
      var decrypted = decipher.update(encrypted,'hex','utf8');
      decrypted += decipher.final('utf8');
      return callback(null, decrypted);
    });
  }

  encrypt(key:string, data:string):string{
    var cipher = crypto.createCipher(this.cryptoAlgorithm,key);
    var encrypted = cipher.update(data,'utf8','hex')
    encrypted += cipher.final('hex');
    return encrypted;
  }

  hash(secret:string, callback:(err, hash:string) => void){
    var params = scrypt.paramsSync(10, 750000000, 0.5);
    scrypt.kdf(secret, params, (err, hash) =>{
      if(err){
        return callback(err, null);
      }
      return callback(null, hash.toString('hex'));
    })
  }

  verifyHash(hash:string, secret:string, callback:(err,matched) =>void) {
    scrypt.verifyKdf(new Buffer(hash, 'hex'), new Buffer(secret), callback);
  }
}