"use strict";
const fs = require('fs');
const inquirer = require('inquirer');
class IceWallet {
    constructor(pathToWalletInfo, pathToUnsignedTransaction, pathToSignedTransaction, newWallet, callback) {
        this.pathToWalletInfo = pathToWalletInfo;
        this.pathToUnsignedTransaction = pathToUnsignedTransaction;
        this.pathToSignedTransaction = pathToSignedTransaction;
        let done = (err, wallet) => {
            if (err && callback) {
                return callback(err, null);
            }
            else if (err) {
                return console.log(err);
            }
            console.log('sucessfully loaded wallet');
            this.wallet = wallet;
            if (callback) {
                return callback(null, this);
            }
            this.displayMainMenu();
        };
        if (newWallet) {
            this.createNewWallet(done);
        }
        else {
            console.log('loading and decryting wallet from ' + this.pathToWalletInfo);
            this.loadWalletFromInfo(done);
        }
    }
    displayMainMenu() {
        let hasAccounts = this.wallet.walletInfo.accounts.length > 0;
        class Choices {
            constructor() {
                if (hasAccounts) {
                    this.selectAccount = 'Select Account';
                }
                this.addAccount = 'Add a New Account';
                this.saveAndQuit = 'Save and Quit (dont quit any other way)';
            }
        }
        let choices = new Choices();
        inquirer.prompt([
            {
                name: 'choice',
                type: 'list',
                message: 'Choose an option',
                choices: Object.keys(choices).map(choice => choices[choice])
            },
            {
                name: 'account',
                type: 'list',
                message: 'Choose an existing account',
                when: answers => answers['choice'] == choices.selectAccount,
                validate: account => {
                    if (!account)
                        return 'Create an account first';
                    else
                        return true;
                },
                choices: this.wallet.walletInfo.accounts.map(account => account.name),
            }])
            .then((answers) => {
            let choice = answers['choice'];
            let account = answers['account'];
            let done = (err) => {
                if (err) {
                    console.log(err);
                }
                if (choice == choices.addAccount) {
                    this.displayMainMenu();
                }
                else if (choice == choices.selectAccount) {
                    this.displayAccountMenu();
                }
            };
            switch (choice) {
                case choices.selectAccount:
                    this.wallet.switchAccount(account, done);
                    break;
                case choices.addAccount:
                    this.addAccount(done);
                    break;
                case choices.saveAndQuit:
                    this.saveAndQuit(done);
                    break;
                default:
                    this.displayMainMenu();
            }
        });
    }
    saveAndQuit(callback) {
        console.log('encerypting and saving wallet to ' + this.pathToWalletInfo);
        this.wallet.exportInfo((err, encrypted) => {
            if (err) {
                return callback(err);
            }
            this.saveInfo(encrypted, (err) => {
                if (err) {
                    return callback(err);
                }
                console.log('Sucessfully encrypted and saved info, goodbye');
                return callback(null);
            });
        });
    }
    saveInfo(encrypted, callback) {
        fs.writeFile(this.pathToWalletInfo, new Buffer(encrypted, 'hex'), (err) => {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IceWallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNlV2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0NvbW1hbmRMaW5lL0ljZVdhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsTUFBTyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7QUFDMUIsTUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFFdEM7SUFHRSxZQUNTLGdCQUF1QixFQUN2Qix5QkFBZ0MsRUFDaEMsdUJBQThCLEVBQ3JDLFNBQWlCLEVBQ2pCLFFBQTRDO1FBSnJDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBTztRQUN2Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQU87UUFDaEMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFPO1FBSW5DLElBQUksSUFBSSxHQUFHLENBQUMsR0FBTyxFQUFFLE1BQW9CO1lBQ3ZDLEVBQUUsQ0FBQSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQSxDQUFDO2dCQUNoQixNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUM1QixDQUFDO1lBQ0gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ1osTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixFQUFFLENBQUEsQ0FBQyxRQUFRLENBQUMsQ0FBQSxDQUFDO2dCQUNYLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUM7WUFDRCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFBO1FBRUQsRUFBRSxDQUFBLENBQUMsU0FBUyxDQUFDLENBQUEsQ0FBQztZ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