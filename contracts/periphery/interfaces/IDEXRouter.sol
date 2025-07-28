// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title DEX Router
 * @author Kai Pasciak
 * @notice Simplifies swaps and liquidity management for users and dApps
 */
interface IDEXRouter {
    // Pure functions 
    /**
     * @notice Returns the contract factory for the network
     * @return The address for factory contract
     */
    function factory() external pure returns (address);

    /**
     * @notice Quotes price for user
     * @param amountA Amount of first token
     * @param reserveA First token reserves
     * @param reserveB Second token reserves
     * @return amountB Quote for output
     */
    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);

    // Liquidity pool functions

    /**
     * @notice Allows a user to contribute to liquidity pool at a specific ratio
     * @param tokenA Address of first token contract
     * @param tokenB Address of second token contract
     * @param amountADesired Desired amount of first token to contribute
     * @param amountBDesired Desired amount of second token to contribute
     * @param amountAMin Minimum acceptable amount to protect from slippage
     * @param amountBMin Minimum acceptable amount of second token
     * @param to Address to send liquidity tokens to
     * @param deadline Deadline to finish transaction by
     * @return amountA Amount of token A added
     * @return amountB Amount of token B added
     * @return liquidity Amount of liquidity tokens minted
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    /**
     * @notice See above. Amount ETH desired is the amount sent with the message
     */
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);

    /**
     * @notice Allow liquidity providers to redeem assets for liquidity tokens
     * @param tokenA Address for first token
     * @param tokenB Address for second token
     * @param liquidity Amount of LP tokens to burn
     * @param amountAMin Minimum acceptable amount of first token
     * @param amountBMin Minimum acceptable amount of second token
     * @param to Address to send assets to
     * @param deadline Deadline for transaction to end
     * @return amountA Amount of first token received
     * @return amountB Amount of second token received
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
    
    /**
     * @notice See above
     */
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);

    // Swap functions
    
    /**
     * @notice Allows user to swap a desired amount of input tokens for variable 
     * amount of output tokens
     * @param amountIn Amount of input tokens desired
     * @param amountOutMin Minimum acceptable output tokens
     * @param path Route that tokens will take across liquidity pools (as array
     * of token addresses) - Use calldata to save on gas and prevent modification
     * @param to Address to send output tokens
     * @param deadline Deadline to finish transaction
     * @return amounts Amounts
     */
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    /**
     * @notice See above
     */
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
    external payable returns (uint[] memory amounts);

    /**
     * @notice See above
     */
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
    external payable returns (uint[] memory amounts);
}