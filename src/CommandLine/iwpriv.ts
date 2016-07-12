#!/usr/bin/env node
import program = require('commander');
import IceWalletPrivate from './IceWalletPrivate'

interface args {
  wallet:string
  input:string
  output:string
}

program
  .version('0.0.1')

program
  .command('open')
  .description('open an existing wallet')
  .option('-w, --wallet <wallet>', 'path to load/save encryped wallet info', 'walletPriv.dat')
  .option('-i, --input [input]', 'path to unsigned input transaction data')
  .option('-o, --output [output]', 'path to output signed transaction data')
  .action(function (args:args){
    if (!args.wallet){
      console.log('Unknown Command: ' + program.args.join(' '));
      return program.help();
    }
    new IceWalletPrivate(args.wallet, args.input, args.output, false);
  });

program
  .command('new')
  .description('create a new wallet')
  .option('-w, --wallet <wallet>', 'path to load/save encryped wallet info', 'walletPriv.dat')
  .option('-i, --input [input]', 'path to unsigned input transaction data')
  .option('-o, --output [output]', 'path to output signed transaction data')
  .action(function (args:args){
    if (!args.wallet){
      console.log('Unknown Command: ' + program.args.join(' '));
      return program.help();
    }
    new IceWalletPrivate(args.wallet, args.input, args.output, true);
  });

program.on('*', function() {
	console.log('Unknown Command: ' + program.args.join(' '));
	program.help();
});

program.parse(process.argv);