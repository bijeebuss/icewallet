"use strict";
const program = require('commander');
const IceWalletPublic_1 = require('./IceWalletPublic');
program
    .version('0.0.1');
program
    .command('open')
    .description('open an existing wallet')
    .option('-w, --wallet <wallet>', 'relative path to load/save encryped wallet info', process.env.HOME + '/walletInfo.dat')
    .option('-o, --output [output]', 'relative path to unsigned input transaction data', process.env.HOME + '/unsignedTransaction.dat')
    .option('-i, --input [input]', 'relative path to output signed transaction data', process.env.HOME + '/signedTransaction.dat')
    .action(function (args) {
    new IceWalletPublic_1.default(args.wallet, args.output, args.input, false);
});
program
    .command('new')
    .description('create a new wallet')
    .option('-w, --wallet <wallet>', 'relative path to load/save encryped wallet info', process.env.HOME + '/walletInfo.dat')
    .option('-o, --output [output]', 'relative path to unsigned input transaction data', process.env.HOME + '/unsignedTransaction.dat')
    .option('-i, --input [input]', 'relative path to output signed transaction data', process.env.HOME + '/signedTransaction.dat')
    .action(function (args) {
    new IceWalletPublic_1.default(args.wallet, args.output, args.input, true);
});
program.on('*', function () {
    console.log('Unknown Command: ' + program.args.join(' '));
    program.help();
});
program.parse(process.argv);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXdwdWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQ29tbWFuZExpbmUvaXdwdWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU8sT0FBTyxXQUFXLFdBQVcsQ0FBQyxDQUFDO0FBQ3RDLGtDQUE0QixtQkFFNUIsQ0FBQyxDQUY4QztBQVEvQyxPQUFPO0tBQ0osT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBRW5CLE9BQU87S0FDSixPQUFPLENBQUMsTUFBTSxDQUFDO0tBQ2YsV0FBVyxDQUFDLHlCQUF5QixDQUFDO0tBQ3RDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxpREFBaUQsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztLQUN4SCxNQUFNLENBQUMsdUJBQXVCLEVBQUUsa0RBQWtELEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsMEJBQTBCLENBQUM7S0FDbEksTUFBTSxDQUFDLHFCQUFxQixFQUFFLGlEQUFpRCxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLHdCQUF3QixDQUFDO0tBQzdILE1BQU0sQ0FBQyxVQUFVLElBQVM7SUFDekIsSUFBSSx5QkFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ25FLENBQUMsQ0FBQyxDQUFDO0FBRUwsT0FBTztLQUNKLE9BQU8sQ0FBQyxLQUFLLENBQUM7S0FDZCxXQUFXLENBQUMscUJBQXFCLENBQUM7S0FDbEMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLGlEQUFpRCxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDO0tBQ3hILE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxrREFBa0QsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRywwQkFBMEIsQ0FBQztLQUNsSSxNQUFNLENBQUMscUJBQXFCLEVBQUUsaURBQWlELEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsd0JBQXdCLENBQUM7S0FDN0gsTUFBTSxDQUFDLFVBQVUsSUFBUztJQUN6QixJQUFJLHlCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEUsQ0FBQyxDQUFDLENBQUM7QUFFTCxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRTtJQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMxRCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFFSCxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyJ9