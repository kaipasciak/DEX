// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './interfaces/IDEXFactory.sol';
import './DEXPair.sol';

contract DEXFactory is IDEXFactory {

    address public owner;
    mapping(address => mapping(address => address)) public getPair;
    // address[] public allPairs;

    constructor() {
        owner = msg.sender;
    }

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    
    function createPair(address tokenA, address tokenB) external returns (address pair){
        // Require that addresses are different
        require(tokenA != tokenB, "Error: Addresses must be different");

        // Sort into ascending order
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);

        // Make sure one isn't zero
        require(token0 != address(0), "Error: Invalid address");

        // Make sure it doesn't exist
        require(getPair[token0][token1] == address(0), "Error: Pair exists");

        // Use create 2
        bytes memory bytecode = type(DEXPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IDEXPair(pair).initialize(token0, token1);

        // Put it in the mapping in both orders
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
    }
}