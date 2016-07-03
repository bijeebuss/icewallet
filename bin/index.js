"use strict";
var program = require('commander');
var IceWalletPrivate_1 = require('./src/CommandLine/IceWalletPrivate');
program
    .version('0.0.1')
    .option('-w, --wallet <wallet>', 'relative path to encryped wallet info')
    .option('-i, --input <input>', 'relative path to unsigned input transaction data', './data/unsignedTransaction.dat')
    .option('-o, --output <output>', 'relative path to output signed transaction data', './data/signedTransaction.dat')
    .parse(process.argv);
var privateWalletCmd = new IceWalletPrivate_1.default(program.wallet, program.input, program.output);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxPQUFPLFdBQVcsV0FBVyxDQUFDLENBQUM7QUFDdEMsaUNBQTZCLG9DQUc3QixDQUFDLENBSGdFO0FBR2pFLE9BQU87S0FDSixPQUFPLENBQUMsT0FBTyxDQUFDO0tBQ2hCLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSx1Q0FBdUMsQ0FBQztLQUN4RSxNQUFNLENBQUMscUJBQXFCLEVBQUUsa0RBQWtELEVBQUUsZ0NBQWdDLENBQUM7S0FDbkgsTUFBTSxDQUFDLHVCQUF1QixFQUFFLGlEQUFpRCxFQUFFLDhCQUE4QixDQUFDO0tBQ2xILEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFdkIsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLDBCQUFnQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMifQ==