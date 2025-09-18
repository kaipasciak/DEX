# Decentralized Exchange
## Author: Kai Pasciak

KaiSwap is a decentralized exchange designed for the Ethereum test network that uses an automated market maker model, and built using
a Hardhat + React architecture. It enables ERC-20 token swapping, liquidity provision and liquidity pool token minting and is based 
on UniSwap V2. 

This project is for local development and is not deployed on a public blockchain.

## Features
- Swap ERC-20 tokens using constant product price quoting
- Add/remove liquidity in exchange for LP tokens
- Deterministic pair creation using `create2`
- Local mock tokens with customizable names and symbols
- React based frontend with MetaMask integration
- Python script for deploying application locally

## Tech Stack
Smart contracts: Solidity (`^0.8.20`)
Local blockchain and development: Hardhat, Ganache
Web3 Interaction: Ethers.js, MetaMask
Testing: Mocha, Chai
Frontend: JavaScript, React, HTML/CSS
Scripting: Python

## Backend Description
The smart contracts are divided into core and periphery contracts. The core contracts include `DEXFactory.sol` and `DEXPair.sol`. The periphery contracts include `DEXRouter.sol` and `DEXQuoter.sol`.
The factory creates and manages pair contracts, and pair contracts represent a unique liquidity pool token for a given pair of tokens to be swapped. The router simplifies swaps and liquidity management for users and dApps, and the quoter is a library that provides utility functions for pricing and data fetching.

The quoter, to keep all of the functions pure, uses create2 to determine the pair contract address ina  couple
of its functions for a given pair. A script was written for this to get the init code of the pair contract. It
can be run from the command line as follows:
npx hardhat run scripts/PairInitCodeHash.js

TODO: Finish

## Frontend Description
In scripts/, deploy.js deploys the Router, Factory, MockWETH and Mock Token smart contracts for the front end to interact with. 

## Local Setup and Usage
3 terminal windows will be needed to run this app
In the first "ganache" window, start ganache blockchain from the project root with the following line:
`ganache-cli`
In the second "backend" window, compile contracts and deploy them from the project root with the following lines:
`npx hardhat compile`
`npx hardhat run scripts/deploy.js --network ganache`
In the third "frontend" window, start the front end window by first navigating to the frontend directory and running the following:
`npm start`
Make sure MetaMask is installed and set to the locally hosted network
Add the first account to MetaMask and import test tokens. Ensure the deployer's account has expected balances



## To-do
- Finish frontend
- Debug, input validation and exception handling etc.
- Fix issue where deployer address/signature is hardcoded, allowing other accounts to sign messages on the deployer's behalf
- Add css





