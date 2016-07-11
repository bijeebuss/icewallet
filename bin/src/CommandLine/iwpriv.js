#!/usr/bin/env node
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXdwcml2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0NvbW1hbmRMaW5lL2l3cHJpdi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU8sT0FBTyxXQUFXLFdBQVcsQ0FBQyxDQUFDO0FBQ3RDLG1DQUE2QixvQkFFN0IsQ0FBQyxDQUZnRDtBQVFqRCxPQUFPO0tBQ0osT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBRW5CLE9BQU87S0FDSixPQUFPLENBQUMsTUFBTSxDQUFDO0tBQ2YsV0FBVyxDQUFDLHlCQUF5QixDQUFDO0tBQ3RDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxpREFBaUQsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztLQUN4SCxNQUFNLENBQUMscUJBQXFCLEVBQUUsa0RBQWtELEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsMEJBQTBCLENBQUM7S0FDaEksTUFBTSxDQUFDLHVCQUF1QixFQUFFLGlEQUFpRCxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLHdCQUF3QixDQUFDO0tBQy9ILE1BQU0sQ0FBQyxVQUFVLElBQVM7SUFDekIsSUFBSSwwQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNwRSxDQUFDLENBQUMsQ0FBQztBQUVMLE9BQU87S0FDSixPQUFPLENBQUMsS0FBSyxDQUFDO0tBQ2QsV0FBVyxDQUFDLHFCQUFxQixDQUFDO0tBQ2xDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxpREFBaUQsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztLQUN4SCxNQUFNLENBQUMscUJBQXFCLEVBQUUsa0RBQWtELEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsMEJBQTBCLENBQUM7S0FDaEksTUFBTSxDQUFDLHVCQUF1QixFQUFFLGlEQUFpRCxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLHdCQUF3QixDQUFDO0tBQy9ILE1BQU0sQ0FBQyxVQUFVLElBQVM7SUFDekIsSUFBSSwwQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuRSxDQUFDLENBQUMsQ0FBQztBQUVMLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzFELE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNoQixDQUFDLENBQUMsQ0FBQztBQUVILE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDIn0=