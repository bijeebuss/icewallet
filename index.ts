import program = require('commander');
import IceWalletPrivate from './src/CommandLine/IceWalletPrivate'

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
  .option('-w, --wallet <wallet>', 'relative path to load/save encryped wallet info', './data/walletInfo.dat')
  .option('-i, --input [input]', 'relative path to unsigned input transaction data', './data/unsignedTransaction.dat')
  .option('-o, --output [output]', 'relative path to output signed transaction data', './data/signedTransaction.dat')
  .action(function (args:args){
    new IceWalletPrivate(args.wallet, args.input, args.output, false);
  });

program
  .command('new') 
  .description('create a new wallet')
  .option('-w, --wallet <wallet>', 'relative path to load/save encryped wallet info', './data/walletInfo.dat')
  .option('-i, --input [input]', 'relative path to unsigned input transaction data', './data/unsignedTransaction.dat')
  .option('-o, --output [output]', 'relative path to output signed transaction data', './data/signedTransaction.dat')
  .action(function (args:args){
    new IceWalletPrivate(args.wallet, args.input, args.output, true);
  });

program.on('*', function() {
	console.log('Unknown Command: ' + program.args.join(' '));
	program.help();
});

program.parse(process.argv);