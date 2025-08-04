// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../core/interfaces/IDEXFactory.sol";

library DEXQuoter {
    /**
     * @notice Calculates the create2 address without making calls
     * @param factory Address for factory contract
     * @param tokenA Address for token A
     * @param tokenB Address for token B
     * @return pair Address for pair contract
     */
    function pairFor(address factory, address tokenA, address tokenB) internal pure returns (address pair) {

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
    function getReserves(address factory, address token0, address token1) internal pure returns (uint reserveA, uint reserveB) {
        // Sort tokens first
        require(token0 != token1, "Error: Identical addresses");
        (address tokenA, address tokenB) = token0 < token1 ? (token0, token1) : (token1, token0);
        require(tokenA != address(0));

        // Get reserves
        address pair = address(uint160(uint256(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(abi.encodePacked(token0, token1)),
                hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' // TODO: Replace with pair contract init code hash
            )))));

        (uint reserve0, uint reserve1) = IDEXPair(pair).getReserves();
        

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

    // Get amounts out


}