// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Dex Contract Factory
 * @author Kai Pasciak
 * @notice Creates pair contracts for token pairs on decentralized exchange
 */
interface IDEXFactory {
    /// @notice Emits an event when a new pair is created
    // event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    /**
     * @notice Validates input addresses and creates pair if not yet created
     * @param tokenA Address of first token
     * @param tokenB Address of second token
     * @return pair Address of the created Pair contract
     */
    function createPair(address tokenA, address tokenB) external returns (address pair);
    
    /**
     * @notice Retrieves Pair contract address if one exists
     * @param tokenA Address of first token
     * @param tokenB Address of second token
     * @return pair Address of retrieved Pair contract
     */
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}