# Decentralized Exchange
## Author: Kai Pasciak

KaiSwap is a decentralized exchange designed for the Ethereum test network that uses an automated market maker model. It enables ERC-20 token swapping, liquidity provision and liquidity pool token minting and is based on UniSwap V2.

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

TODO: Finish

## Frontend Description

## Local Setup and Usage
Work in progress

## To-do
- Implement swap in pair
- Consider turning all ints to 256 since twap (and therefore floating point numbers) won't be implemented

