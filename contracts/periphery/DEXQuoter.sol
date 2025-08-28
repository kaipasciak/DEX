// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../core/interfaces/IDEXFactory.sol";
import "../core/interfaces/IDEXPair.sol";

library DEXQuoter {
    /**
     * @notice Calculates the create2 address without making calls
     * @param factory Address for factory contract
     * @param tokenA Address for token A
     * @param tokenB Address for token B
     * @return pair Address for pair contract
     */
    function pairFor(address factory, address tokenA, address tokenB) internal pure returns (address pair) {
        // Sort tokens first
        require(tokenA != tokenB, "Error: Identical addresses");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(tokenA != address(0));

        pair = address(uint160(uint(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(abi.encodePacked(token0, token1)),
                hex'1b59548e5075ef892bca3770df21f05777ec52e10dadfa0461069a2bde38b20e' // init code hash
            )))));
    }


    // Get reserves
    /**
     * @notice Returns the amounts of token A and token B reserves
     * @param factory Address of the factory contract
     * @param token0 Address of token A
     * @param token1 Address of token B
     * @return reserveA Amount of token A reserves
     * @return reserveB Amount of token B reserves
     */
    function getReserves(address factory, address token0, address token1) internal view returns (uint reserveA, uint reserveB) {
        // Sort tokens first
        require(token0 != token1, "Error: Identical addresses");
        (address tokenA, address tokenB) = token0 < token1 ? (token0, token1) : (token1, token0);
        require(tokenA != address(0));

        // Get reserves
        address pair = address(uint160(uint256(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(abi.encodePacked(tokenA, tokenB)),
                hex'1b59548e5075ef892bca3770df21f05777ec52e10dadfa0461069a2bde38b20e' // TODO: Replace with pair contract init code hash
            )))));

        (uint reserve0, uint reserve1) = IDEXPair(pair).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
        
    }

    /**
     * @notice Given an amount of token A and the reserves of token A and B, returns the equivalent amount of token B
     * @param amountA Amount of token A
     * @param reserveA Amount of token A reserves
     * @param reserveB Amount of token B reserves
     * @return amountB Equivalent amount of token B
     */
    function quote(uint amountA, uint reserveA, uint reserveB) internal pure returns (uint amountB) {
        require(amountA > 0, "Error: Insufficient amount");
        require(reserveA > 0, "Error: Insufficient liquidity");
        require(reserveB > 0, "Error: Insufficient liquidity");

        amountB = (reserveB / reserveA) * amountA;
    }

    // Get amount out
    /**
     * @notice Given an input amount, calculate the output
     * @param amountIn Input amount
     * @param reserveIn Amount in input token reserves
     * @param reserveOut Amount in output token reserves
     * @return amountOut Output amount
     */
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
        require(reserveIn > 0 && reserveOut > 0, "Error: Insufficient liquidity");
        require(amountIn > 0, "Error: Invalid input amount");

        uint postFee = amountIn * 997;
        amountOut = (postFee * reserveOut) / ((reserveOut * 1000) + postFee);
    }

    // Get amounts out
    /**
     * @notice Chained get amount calculations on any number of pairs
     * @param factory Factory contract address
     * @param amountIn Amount of input token
     * @param path Address path
     * @return amounts Array of amounts for each swap
     */
    function getAmountsOut(address factory, uint amountIn, address[] memory path) internal view returns (uint[] memory amounts) {
        require(path.length >= 2, 'Error: Invalid path');
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        for (uint i; i < path.length - 1; i++) {
            (uint reserveIn, uint reserveOut) = getReserves(factory, path[i], path[i + 1]);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }
}