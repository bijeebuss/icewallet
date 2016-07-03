import program = require('commander');
import IceWalletPrivate from './src/CommandLine/IceWalletPrivate'


program
  .version('0.0.1')
  .option('-w, --wallet <wallet>', 'relative path to encryped wallet info')
  .option('-i, --input <input>', 'relative path to unsigned input transaction data', './data/unsignedTransaction.dat')
  .option('-o, --output <output>', 'relative path to output signed transaction data', './data/signedTransaction.dat')
  .parse(process.argv);

let privateWalletCmd = new IceWalletPrivate(program.wallet, program.input, program.output);

