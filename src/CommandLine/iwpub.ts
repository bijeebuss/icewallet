import program = require('commander');
import IceWalletPublic from './IceWalletPublic'

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
  .option('-w, --wallet <wallet>', 'relative path to load/save encryped wallet info', process.env.HOME + '/walletInfo.dat')
  .option('-o, --output [output]', 'relative path to unsigned input transaction data', process.env.HOME + '/unsignedTransaction.dat')
  .option('-i, --input [input]', 'relative path to output signed transaction data', process.env.HOME + '/signedTransaction.dat')
  .action(function (args:args){
    new IceWalletPublic(args.wallet, args.input, args.output, false);
  });

program
  .command('new')
  .description('create a new wallet')
  .option('-w, --wallet <wallet>', 'relative path to load/save encryped wallet info', process.env.HOME + '/walletInfo.dat')
  .option('-o, --output [output]', 'relative path to unsigned input transaction data', process.env.HOME + '/unsignedTransaction.dat')
  .option('-i, --input [input]', 'relative path to output signed transaction data', process.env.HOME + '/signedTransaction.dat')
  .action(function (args:args){
    new IceWalletPublic(args.wallet, args.input, args.output, true);
  });

program.on('*', function() {
	console.log('Unknown Command: ' + program.args.join(' '));
	program.help();
});

program.parse(process.argv);