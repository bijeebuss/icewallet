#!/usr/bin/env node
"use strict";
const program = require('commander');
const IceWalletPublic_1 = require('./IceWalletPublic');
program
    .version('0.0.1');
program
    .command('open')
    .description('open an existing wallet')
    .option('-w, --wallet <wallet>', 'path to load/save encryped wallet info', process.env.HOME + '/walletInfo.dat')
    .option('-o, --output [output]', 'path to unsigned input transaction data', process.env.HOME + '/unsignedTransaction.dat')
    .option('-i, --input [input]', 'path to output signed transaction data', process.env.HOME + '/signedTransaction.dat')
    .action(function (args) {
    new IceWalletPublic_1.default(args.wallet, args.output, args.input, false);
});
program
    .command('new')
    .description('create a new wallet')
    .option('-w, --wallet <wallet>', 'path to load/save encryped wallet info', process.env.HOME + '/walletInfo.dat')
    .option('-o, --output [output]', 'path to unsigned input transaction data', process.env.HOME + '/unsignedTransaction.dat')
    .option('-i, --input [input]', 'path to output signed transaction data', process.env.HOME + '/signedTransaction.dat')
    .action(function (args) {
    new IceWalletPublic_1.default(args.wallet, args.output, args.input, true);
});
program.on('*', function () {
    console.log('Unknown Command: ' + program.args.join(' '));
    program.help();
});
program.parse(process.argv);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXdwdWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQ29tbWFuZExpbmUvaXdwdWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxNQUFPLE9BQU8sV0FBVyxXQUFXLENBQUMsQ0FBQztBQUN0QyxrQ0FBNEIsbUJBRTVCLENBQUMsQ0FGOEM7QUFRL0MsT0FBTztLQUNKLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUVuQixPQUFPO0tBQ0osT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUNmLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQztLQUN0QyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsd0NBQXdDLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUM7S0FDL0csTUFBTSxDQUFDLHVCQUF1QixFQUFFLHlDQUF5QyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLDBCQUEwQixDQUFDO0tBQ3pILE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSx3Q0FBd0MsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyx3QkFBd0IsQ0FBQztLQUNwSCxNQUFNLENBQUMsVUFBVSxJQUFTO0lBQ3pCLElBQUkseUJBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNuRSxDQUFDLENBQUMsQ0FBQztBQUVMLE9BQU87S0FDSixPQUFPLENBQUMsS0FBSyxDQUFDO0tBQ2QsV0FBVyxDQUFDLHFCQUFxQixDQUFDO0tBQ2xDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSx3Q0FBd0MsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztLQUMvRyxNQUFNLENBQUMsdUJBQXVCLEVBQUUseUNBQXlDLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsMEJBQTBCLENBQUM7S0FDekgsTUFBTSxDQUFDLHFCQUFxQixFQUFFLHdDQUF3QyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLHdCQUF3QixDQUFDO0tBQ3BILE1BQU0sQ0FBQyxVQUFVLElBQVM7SUFDekIsSUFBSSx5QkFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xFLENBQUMsQ0FBQyxDQUFDO0FBRUwsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBRUgsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMifQ==