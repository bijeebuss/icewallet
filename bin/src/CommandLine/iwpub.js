#!/usr/bin/env node
"use strict";
const program = require('commander');
const IceWalletPublic_1 = require('./IceWalletPublic');
program
    .version('0.0.1');
program
    .command('open')
    .description('open an existing wallet')
    .option('-w, --wallet <wallet>', 'path to load/save encryped wallet info', 'walletPub.dat')
    .option('-o, --output [output]', 'path to unsigned input transaction data')
    .option('-i, --input [input]', 'path to output signed transaction data')
    .action(function (args) {
    if (!args.wallet) {
        console.log('Unknown Command: ' + program.args.join(' '));
        return program.help();
    }
    new IceWalletPublic_1.default(args.wallet, args.output, args.input, false);
});
program
    .command('new')
    .description('create a new wallet')
    .option('-w, --wallet <wallet>', 'path to load/save encryped wallet info', 'walletPub.dat')
    .option('-o, --output [output]', 'path to unsigned input transaction data')
    .option('-i, --input [input]', 'path to output signed transaction data')
    .action(function (args) {
    if (!args.wallet) {
        console.log('Unknown Command: ' + program.args.join(' '));
        return program.help();
    }
    new IceWalletPublic_1.default(args.wallet, args.output, args.input, true);
});
program.on('*', function () {
    console.log('Unknown Command: ' + program.args.join(' '));
    program.help();
});
program.parse(process.argv);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXdwdWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQ29tbWFuZExpbmUvaXdwdWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxNQUFPLE9BQU8sV0FBVyxXQUFXLENBQUMsQ0FBQztBQUN0QyxrQ0FBNEIsbUJBRTVCLENBQUMsQ0FGOEM7QUFRL0MsT0FBTztLQUNKLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUVuQixPQUFPO0tBQ0osT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUNmLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQztLQUN0QyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsd0NBQXdDLEVBQUUsZUFBZSxDQUFDO0tBQzFGLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSx5Q0FBeUMsQ0FBQztLQUMxRSxNQUFNLENBQUMscUJBQXFCLEVBQUUsd0NBQXdDLENBQUM7S0FDdkUsTUFBTSxDQUFDLFVBQVUsSUFBUztJQUN6QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxRCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLHlCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDbkUsQ0FBQyxDQUFDLENBQUM7QUFFTCxPQUFPO0tBQ0osT0FBTyxDQUFDLEtBQUssQ0FBQztLQUNkLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQztLQUNsQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsd0NBQXdDLEVBQUUsZUFBZSxDQUFDO0tBQzFGLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSx5Q0FBeUMsQ0FBQztLQUMxRSxNQUFNLENBQUMscUJBQXFCLEVBQUUsd0NBQXdDLENBQUM7S0FDdkUsTUFBTSxDQUFDLFVBQVUsSUFBUztJQUN6QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxRCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLHlCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEUsQ0FBQyxDQUFDLENBQUM7QUFFTCxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRTtJQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMxRCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFFSCxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyJ9