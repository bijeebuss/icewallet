"use strict";
var program = require('commander');
var IceWalletPrivate_1 = require('./src/CommandLine/IceWalletPrivate');
program
    .version('0.0.1');
program
    .command('open')
    .description('open an existing wallet')
    .option('-w, --wallet <wallet>', 'relative path to load/save encryped wallet info', './data/walletInfo.dat')
    .option('-i, --input [input]', 'relative path to unsigned input transaction data', './data/unsignedTransaction.dat')
    .option('-o, --output [output]', 'relative path to output signed transaction data', './data/signedTransaction.dat')
    .action(function (args) {
    new IceWalletPrivate_1.default(args.wallet, args.input, args.output, false);
});
program
    .command('new')
    .description('create a new wallet')
    .option('-w, --wallet <wallet>', 'relative path to load/save encryped wallet info', './data/walletInfo.dat')
    .option('-i, --input [input]', 'relative path to unsigned input transaction data', './data/unsignedTransaction.dat')
    .option('-o, --output [output]', 'relative path to output signed transaction data', './data/signedTransaction.dat')
    .action(function (args) {
    new IceWalletPrivate_1.default(args.wallet, args.input, args.output, true);
});
program.on('*', function () {
    console.log('Unknown Command: ' + program.args.join(' '));
    program.help();
});
program.parse(process.argv);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxPQUFPLFdBQVcsV0FBVyxDQUFDLENBQUM7QUFDdEMsaUNBQTZCLG9DQUU3QixDQUFDLENBRmdFO0FBUWpFLE9BQU87S0FDSixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7QUFFbkIsT0FBTztLQUNKLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FDZixXQUFXLENBQUMseUJBQXlCLENBQUM7S0FDdEMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLGlEQUFpRCxFQUFFLHVCQUF1QixDQUFDO0tBQzNHLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxrREFBa0QsRUFBRSxnQ0FBZ0MsQ0FBQztLQUNuSCxNQUFNLENBQUMsdUJBQXVCLEVBQUUsaURBQWlELEVBQUUsOEJBQThCLENBQUM7S0FDbEgsTUFBTSxDQUFDLFVBQVUsSUFBUztJQUN6QixJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3BFLENBQUMsQ0FBQyxDQUFDO0FBRUwsT0FBTztLQUNKLE9BQU8sQ0FBQyxLQUFLLENBQUM7S0FDZCxXQUFXLENBQUMscUJBQXFCLENBQUM7S0FDbEMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLGlEQUFpRCxFQUFFLHVCQUF1QixDQUFDO0tBQzNHLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxrREFBa0QsRUFBRSxnQ0FBZ0MsQ0FBQztLQUNuSCxNQUFNLENBQUMsdUJBQXVCLEVBQUUsaURBQWlELEVBQUUsOEJBQThCLENBQUM7S0FDbEgsTUFBTSxDQUFDLFVBQVUsSUFBUztJQUN6QixJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25FLENBQUMsQ0FBQyxDQUFDO0FBRUwsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBRUgsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMifQ==