"use strict";
const program = require('commander');
const IceWalletPrivate_1 = require('./IceWalletPrivate');
program
    .version('0.0.1');
program
    .command('open')
    .description('open an existing wallet')
    .option('-w, --wallet <wallet>', 'relative path to load/save encryped wallet info', process.env.HOME + '/walletInfo.dat')
    .option('-i, --input [input]', 'relative path to unsigned input transaction data', process.env.HOME + '/unsignedTransaction.dat')
    .option('-o, --output [output]', 'relative path to output signed transaction data', process.env.HOME + '/signedTransaction.dat')
    .action(function (args) {
    new IceWalletPrivate_1.default(args.wallet, args.input, args.output, false);
});
program
    .command('new')
    .description('create a new wallet')
    .option('-w, --wallet <wallet>', 'relative path to load/save encryped wallet info', process.env.HOME + '/walletInfo.dat')
    .option('-i, --input [input]', 'relative path to unsigned input transaction data', process.env.HOME + '/unsignedTransaction.dat')
    .option('-o, --output [output]', 'relative path to output signed transaction data', process.env.HOME + '/signedTransaction.dat')
    .action(function (args) {
    new IceWalletPrivate_1.default(args.wallet, args.input, args.output, true);
});
program.on('*', function () {
    console.log('Unknown Command: ' + program.args.join(' '));
    program.help();
});
program.parse(process.argv);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXdwcml2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0NvbW1hbmRMaW5lL2l3cHJpdi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsTUFBTyxPQUFPLFdBQVcsV0FBVyxDQUFDLENBQUM7QUFDdEMsbUNBQTZCLG9CQUU3QixDQUFDLENBRmdEO0FBUWpELE9BQU87S0FDSixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7QUFFbkIsT0FBTztLQUNKLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FDZixXQUFXLENBQUMseUJBQXlCLENBQUM7S0FDdEMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLGlEQUFpRCxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDO0tBQ3hILE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxrREFBa0QsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRywwQkFBMEIsQ0FBQztLQUNoSSxNQUFNLENBQUMsdUJBQXVCLEVBQUUsaURBQWlELEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsd0JBQXdCLENBQUM7S0FDL0gsTUFBTSxDQUFDLFVBQVUsSUFBUztJQUN6QixJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3BFLENBQUMsQ0FBQyxDQUFDO0FBRUwsT0FBTztLQUNKLE9BQU8sQ0FBQyxLQUFLLENBQUM7S0FDZCxXQUFXLENBQUMscUJBQXFCLENBQUM7S0FDbEMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLGlEQUFpRCxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDO0tBQ3hILE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxrREFBa0QsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRywwQkFBMEIsQ0FBQztLQUNoSSxNQUFNLENBQUMsdUJBQXVCLEVBQUUsaURBQWlELEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsd0JBQXdCLENBQUM7S0FDL0gsTUFBTSxDQUFDLFVBQVUsSUFBUztJQUN6QixJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25FLENBQUMsQ0FBQyxDQUFDO0FBRUwsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBRUgsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMifQ==