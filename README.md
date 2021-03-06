# Crowdsource on blockchain

## Environment requirements
* Truffle v5.0.5 (core: 5.0.5)
* Solidity v0.5.0 (solc-js)
* Node v11.13.0

## Set up
To install run the following command

```
npm i
truffle compile
```

To run:
```
npm run dev
```

It will open a window on Chrome. You need to install MetaMask chrome extension, 
set up an account and connect to the Rinkeby network to be able to use this program

## Code navigation
* contracts/ : contains the contracts code in Solidity
* src/: contains the frontend code in html and javascript

`npm run dev` run a server (lite-browser) process configured by `bs-config.js` 

## Development
If you want to contribute to this repo, you can start your own blockchain using ganache then run:

```
truffle migrate --reset
```
Then you can modify the code locally.

## Examples and demo
Our example contract is online on Ethereum and rinkeby

rinkeby: https://rinkeby.etherscan.io/address/0x244ac8ca6af07e3f5dd28bfa3c8fafcd2222628c#code

Ethereum: https://etherscan.io/address/0xCe8296F1daCd7C6ECa28453f37fE15E0596CDaEA

Video demo:
https://www.youtube.com/watch?v=DNgvUu5HJRU&ab_channel=LinhHo%C3%A0ng

Read our report: [report](HOW_IT_WORKS.pdf)
