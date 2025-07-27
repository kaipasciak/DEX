// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Dex Pair Contract 
 * @author Kai Pasciak
 * @notice Manages liquidity pools and acts as an automated market maker
 */

interface IDEXPair {
    /// events will go below

    /// primary functions below

    /**
     * @notice Executes token swaps
     * @param amount0out Amount of token 1 output
     * @param amount1out Amount of token 2 output
     * @param to Address for output to be sent
     * @param data May be omitted, this is just for flash swaps
     */
    function swap(uint amount0out, uint amount1out, address to, bytes calldata data) external;

    /**
     *  @notice Issues pool tokens to liquidity providers after depositing liquidity
     *  @param to Address for minted tokens to be sent to
     *  @return liquidity The amount of LP tokens minted 
     */ 
    function mint(address to) external returns (uint liquidity);

    /**
     * @notice Burns tokens in exchange for the underlying assets
     * @param to Address to send assets to
     * @return amount0 Amounts sent to to of first asset
     * @return amount1 Amounts sent to to of second asset
     */
    function burn(address to) external returns (uint amount0, uint amount1);

}