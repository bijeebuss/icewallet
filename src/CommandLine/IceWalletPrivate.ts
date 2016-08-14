import fs = require('fs');
let qrcode = require('qrcode-terminal');
let unit = require('bitcore-lib').Unit;
let intl = require('intl');
import PrivateWalletService from '../Services/PrivateWalletService';
import IceWallet from './IceWallet';
import {PrivateWalletInfo} from '../Models/PrivateWalletInfo';
import TransactionInfo from '../Models/transactionInfo';
import inquirer = require('inquirer');

export default class IceWalletPrivate extends IceWallet {
  wallet:PrivateWalletService;

  loadWalletFromInfo(callback:(err:any,wallet:PrivateWalletService) => void) {
    inquirer.prompt({
      name:'password',
      type:'password',
      message:'enter your password to open the wallet',
    })
    .then((answers:any) => {
      let password = answers['password'].toString();
      console.log('loading and decrypting wallet info from' + this.pathToWalletInfo);
      console.log('this might take a minute');
      fs.readFile(this.pathToWalletInfo, 'hex', (err, data) => {
        if (err){
          return callback(err,null);
        }
        PrivateWalletService.openWallet(password, data, (err, info, wallet) => {
          if(err == 'SEED_MISSING'){
            return this.verifySeed(password, info, callback);
          }
          else if (err){
            return callback(err, null);
          }
          return callback(err, wallet);
        })
      })
    })
  }

  verifySeed(password:string, info:PrivateWalletInfo, callback:(err:any, wallet:PrivateWalletService) => void){
    inquirer.prompt([{
      name:'seed',
      message:'the seed is not stored in the info please enter it now to open the wallet',
    }])
    .then((answers:any) => {
      console.log('verifying seed...')
      PrivateWalletService.seedWallet(password, info, answers['seed'].toString(), callback); 
    })
  }

  createNewWallet(callback:(err:any,wallet:PrivateWalletService) => void){
    inquirer.prompt([
      {
        name:'password1',
        type:'password',
        message:'create a password',
        validate:(password) => {if(!password) return 'Password required'; else return true}
      },
      {
        name:'password2',
        type:'password',
        message:'retype password',
        validate:(password) => {if(!password) return 'Password required'; else return true}
      }])
      .then((passwords:any) => {
        if(passwords['password1'] != passwords['password2']){
          return callback('Passwords dont match', null);
        }
        let password = passwords['password1'];
        inquirer.prompt([
          {
            name:'seed',
            message:'Please type the BIP39 Mnemonic seed for the new wallet, or leave blank for random',
            default:null,
          },
          {
            name:'exportSeed',
            message:'Do you want to export the seed with the wallet info, (exports are always encrypted)?',
            type:'confirm',
          },
        ])
        .then((answers:any) => {
          var info = new PrivateWalletInfo(answers['seed'].toString(), Boolean(answers['exportSeed']));
          try {
            var wallet = new PrivateWalletService(info, password.toString());
          }
          catch (err){
            return callback(err,null);
          }
          console.log('sucessfully created wallet');
          return callback(null, wallet);
        })
      })
  }

  addAccount(callback:(err:any) => void){
    inquirer.prompt([
      {
        name:'name',
        message:'Give a name for this account, be descriptive',
      },
      {
        name:'index',
        message:'what is the BIP32 derivation index for this account',
        validate:(externalIndex) => {if(!Number.isInteger(Number(externalIndex))) return 'Must be an integer'; else return true}            
      },
      {
        name:'externalIndex',
        message:'What is the starting external address index',
        default:0,
        validate:(externalIndex) => {if(!Number.isInteger(Number(externalIndex))) return 'Must be an integer'; else return true}
      },
      {
        name:'changeIndex',
        message:'What is the starting change address index',
        default:0,
        validate:(changeIndex) => {if(!Number.isInteger(Number(changeIndex))) return 'Must be an integer'; else return true}
      },
    ])
    .then((answers:any) => {
      this.wallet.walletInfo.addAccount(answers['name'], Number(answers['index']), Number(answers['changeIndex']), Number(answers['externalIndex']))
      return callback(null);
    })
  }
  
  displayAccountMenu(){
    class Choices {
      [key: string]: string;
      deposit = 'Deposit';
      sign = 'Sign Transaction';
      showUsed = 'Show Used Addresses';
      exportAddresses = 'Export Addresses';
      showSeed = 'Show seed';
      showXpub = 'Show Account Public Key';
      changeUsedAddresses = 'Update Used Address Indexes';
      backToMain = 'Back To Main Menu';
      saveAndQuit = 'Save and Quit (dont quit any other way)';
    }

    let choices = new Choices();

    console.log('----------' + this.wallet.selectedAccount.name + '----------');
    inquirer.prompt([
      {
        name:'choice',
        type:'list',
        message:'Choose an option',
        choices: Object.keys(choices).map<string>(choice => choices[choice])
      },
      {
        name:'fee',
        message:'enter your desired fee in bits',
        when: (answers) => {
          return answers['choice'] == choices.sign
        },
        validate:(fee) => {if(!Number.isInteger(Number(fee))) return 'Must be an integer'; else return true}
      }])
      .then((answers:any) => {
        let choice:string = answers['choice'];
        let fee = Number(unit.fromBits(answers['fee']).satoshis);
        let done = (err:any) => {
          if (err){
            console.log(err);
          }
          if (choice != choices.saveAndQuit){
            this.displayAccountMenu();
          }
        }
        switch(choice){
          case choices.deposit: 
            this.deposit(done);
            break;
          case choices.sign:
            this.sign(fee, done);
            break;
          case choices.showUsed:
            this.printAddresses();  
            done(null);
            break;
          case choices.exportAddresses:
            this.exportAddresses(done);
            break;  
          case choices.changeUsedAddresses:
            this.changeUsedAddresses(done);
            break;
          case choices.showSeed:  
            console.log(this.wallet.walletInfo.seed);
            done(null);
            break;
          case choices.showXpub:
            qrcode.generate(this.wallet.selectedAccount.xpub);
            console.log(this.wallet.selectedAccount.xpub);
            this.displayAccountMenu();
            break;
          case choices.backToMain:
            this.displayMainMenu();
            break;
          case choices.saveAndQuit:
            this.saveAndQuit(done);
            break;
          default:
            this.displayAccountMenu();
        }
      })
  }

  deposit(callback:(err:any) => void){
    var newAddress = this.wallet.getDepositAddress();
    console.log('Send coins to:' + newAddress);
    qrcode.generate(newAddress);
    inquirer.prompt(
      {
        name:'choice',
        message:'Did the transaction complete?',
        type:'confirm'
      })
      .then((answers:any) => {
        if(answers['choice']){
          console.log('good')
          this.wallet.incrementExternalIndex();
        }
        else if(answers['choice']){
          console.log('try again');
        }
        return callback(null);
    })
  }

  verifyTransaction(transaction:TransactionInfo, fee:number, callback:(err:any) => void){
    console.log('Please verify this transaction');
    for(let address in transaction.outputTotals){
      console.log('Send: '   + unit.fromSatoshis(transaction.outputTotals[address]).bits.toLocaleString() + ' bits');
      console.log('To:   '   + address);
    }

    console.log('Fee:  '   + unit.fromSatoshis(fee).bits.toLocaleString() + ' bits');

    inquirer.prompt({
      name:'complete',
      type:'confirm',
      message:'answer y/n',
    })
    .then((answers:any) => {
      let complete:boolean = answers['complete'];
      if(complete){
        return callback(null);
      }
      else {
        return callback('Fix issues and try again');
      }
    });
  }

  sign(fee:number, callback:(err:any) => void){
    inquirer.prompt([
      {
        name:'import',
        message:'type the import path (path to unsigned transaction)',
        when: (answers) => {
          return (!this.pathToUnsignedTransaction)
        },
      },
      {
        name:'export',
        message:'type the export path',
        when: (answers) => {
          return (!this.pathToSignedTransaction)
        },
      }])
      .then((answers:any) => {
        var outputPath:string = this.pathToSignedTransaction || answers['export'];
        var importPath:string = this.pathToUnsignedTransaction || answers['import'];
        fs.readFile(importPath || answers['import'], 'utf8', (err, serialized) => {
          if(err){
            return callback(err);
          }
          var transactionInfo = this.wallet.parseTransaction(serialized);

          this.verifyTransaction(transactionInfo, fee, (err) => {
            if (err){
              return callback(err);
            }

            try {
            // add the fee, change script and sign it
            var signed = this.wallet.completeTransaction(serialized, fee);
            }
            catch(err){
              return callback(err);
            }
            // export the signed transaction
            fs.writeFile(outputPath, signed, (err) => {
              if(err){
                return callback(err);
              }
              // update the change index count
              this.wallet.incrementChangeIndex();
              console.log('transaction successfully signed and written to: ' + outputPath);
              return callback(null);  
            })
          })
        })
      }
    )
  }

  printAddresses(){
    console.log('change: ');
    this.wallet.addressRange(0, this.wallet.nextChangeIndex - 1, true).forEach((address) => {
      console.log('\t' + address);
    })
    console.log('external: ');
    this.wallet.addressRange(0, this.wallet.nextExternalIndex - 1, false).forEach((address) => {
      console.log('\t' + address);
    })
  }

  exportAddresses(callback:(err:any) => void){
    inquirer.prompt([
      {
        name:'count',
        message:'How many addresses?',
        validate:(fee) => {if(!Number.isInteger(Number(fee))) return 'Must be an integer'; else return true}
      },
      {
        name:'burn',
        message:'Mark these as used? (may cause issues updating public wallet if you dont use them then deposit to this account again)',
        type:'confirm',
      },
      {
        name:'path',
        message:'Type the export path',
      },
    ])
    .then((answers:any) => {
      let count = Number(answers['count']);
      let burn = Boolean(answers['burn']);
      let path:string = answers['path'];
      let starting = this.wallet.nextExternalIndex;
      let ending = starting + count - 1;
      
      var addresses = this.wallet.addressRange(starting, ending, false)
      fs.writeFile(path, JSON.stringify(addresses), (err) => {          
        addresses.forEach((address) => {
          console.log(address);
        })
        if(burn){
          this.wallet.nextExternalIndex += count;
        }
        console.log('Adress list saved to ' + path);          
        callback(null);
      })
    })
  }
  changeUsedAddresses(callback:(err:any) => void){
    inquirer.prompt([
      {
        name:'externalIndex',
        message:'How many external addresses have been used',
        default:0,
        validate:(externalIndex) => {if(!Number.isInteger(Number(externalIndex))) return 'Must be an integer'; else return true}
      },
      {
        name:'changeIndex',
        message:'How many change addresses have been used',
        default:0,
        validate:(changeIndex) => {if(!Number.isInteger(Number(changeIndex))) return 'Must be an integer'; else return true}
      },
      ])
      .then((answers:any) => {
        this.wallet.nextExternalIndex = Number(answers['externalIndex']);
        this.wallet.nextChangeIndex = Number(answers['changeIndex']);
        console.log('sucessfully updated wallet');
        return callback(null); 
      })
  }
}