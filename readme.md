# IceWallet
Cold storage enabled command line bitcoin wallet based on [bitpay's bitcore](https://github.com/bitpay/bitcore-lib)
##Setup
To use as a cold storage wallet you will need to be familiarity with the command line and two computers (if you just want to try it out skip to usage)

1. Your main computer
2. A small inexpensive computer, preferably with no wifi, such as raspberry pi zero

## Usage
### Command Line
#### Creating or importing a wallet
1. install on both computers

    `npm install icewallet -g`

2. disconnect the cold storage computer from the internet

3. create a new private wallet on the cold storage computer

    `iwpriv new`

4. after its created, select the option to print the public key

5. create a new public wallet on your main computer (it will ask for the public key from the previous step)

    `iwpub new`

thats it, now you have a cold storage wallet
#### Withdraw from cold storage
1. open the public wallet on your main computer

    `iwpub open`

2. select "Initiate Withdraw" from the menu
3. choose a path to your usb flash drive
4. unmount the flash drive then insert it into the cold storage computer
5. open the private wallet then select "Withdraw" from the menu

    `iwpriv open`

6. choose an export path on the flash drive
7. unmount the flash drive and put it back into the main computer
8. open the public wallet wallet and choose "Complete Transaction" from the menu

    `iwpub open`

#### Deposit to cold storage
1. open the private wallet on the cold storage computer and select deposit from the menu

    `iwpriv open`

2. scan the QR code or copy down the address on the wallet you are sending funds from 
