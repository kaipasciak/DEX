// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './interfaces/IDEXRouter.sol';
import './DEXQuoter.sol';
import './interfaces/IWETH.sol';
import '../libraries/Transfer.sol';

contract DEXRouter is IDEXRouter {
    address public immutable override factory;
    address public immutable override WETH;

    /**
     * @notice Factory address is set on construction
     * @param _factory Address of the factory contract
     */
    constructor(address _factory, address _WETH) {
        factory = _factory;
        WETH = _WETH;
    }

    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, 'Error: Expired');
        _;
    }

    event Amounts(uint min, uint optimal, uint desired);

    // Liquidity Functions

    /**
     * @notice Call's the library's quote function
     * @param amountA Amount of token A for input
     * @param reserveA Amount of token A in reserves
     * @param reserveB Amount of token B in reserves
     * @return amountB Equivalent amount of token B
     */
    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB) {
        return DEXQuoter.quote(amountA, reserveA, reserveB);
    }

    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) private returns (uint amountA, uint amountB) {
        // Create pair if not yet in factory
        if (IDEXFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            IDEXFactory(factory).createPair(tokenA, tokenB);
        }
        (uint reserveA, uint reserveB) = DEXQuoter.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        }
        else {
            uint amountBOptimal = DEXQuoter.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Error: Insufficient B amount");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = DEXQuoter.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, "Error: Insufficient A amount");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external override ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = DEXQuoter.pairFor(factory, tokenA, tokenB);

        // Transfer
        Transfer.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        Transfer.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IDEXPair(pair).mint(to);
    }


    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable ensure(deadline) returns (uint amountToken, uint amountETH, uint liquidity) {
        (amountToken, amountETH) = _addLiquidity(
            token,
            WETH,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountETHMin
        );
        address pair = DEXQuoter.pairFor(factory, token, WETH);
        Transfer.safeTransferFrom(token, msg.sender, pair, amountToken);
        IWETH(WETH).deposit{value: amountETH}();
        assert(IWETH(WETH).transfer(pair, amountETH));
        liquidity = IDEXPair(pair).mint(to);
        if (msg.value > amountETH) Transfer.safeTransferETH(msg.sender, msg.value - amountETH);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public override ensure(deadline) returns (uint amountA, uint amountB) {
        address pair = DEXQuoter.pairFor(factory, tokenA, tokenB);
        IDEXPair(pair).transferFrom(msg.sender, pair, liquidity);
        (uint amount0, uint amount1) = IDEXPair(pair).burn(to);
        (address token0,) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, 'Error: Insufficient A amount');
        require(amountB >= amountBMin, 'Error: Insufficient B amount');
    }

    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) public override ensure(deadline) returns (uint amountToken, uint amountETH) {
        (amountToken, amountETH) = removeLiquidity(
            token,
            WETH,
            liquidity,
            amountTokenMin,
            amountETHMin,
            address(this),
            deadline
        );
        Transfer.safeTransfer(token, to, amountToken);
    }

    // Swap Functions
    function _swap(uint[] memory amounts, address[] memory path, address _to) private {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = input < output ? (input, output) : (output, input);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? DEXQuoter.pairFor(factory, output, path[i + 2]) : _to;
            IDEXPair(DEXQuoter.pairFor(factory, input, output)).swap(amount0Out, amount1Out, to);
        }
    }

    // User calls IERC20(tokenIn).approve(router addr, amountIn) for the first transfer below to work
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external override ensure(deadline) returns (uint[] memory amounts) {
        amounts = DEXQuoter.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'Error: Insufficient output amount');
        Transfer.safeTransferFrom(path[0], msg.sender, DEXQuoter.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
    external override ensure(deadline) payable returns (uint[] memory amounts) {
        require(path[0] == WETH, 'Error: Invalid path');
        amounts = DEXQuoter.getAmountsOut(factory, msg.value, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'Insufficient output amount');
        IWETH(WETH).deposit{value: amounts[0]}();
        assert(IWETH(WETH).transfer(DEXQuoter.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
    }

    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
    external override ensure(deadline) payable returns (uint[] memory amounts) {
        require(path[path.length - 1] == WETH, 'Error: Invalid path');
        amounts = DEXQuoter.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'Error: Insufficient output amount');
        Transfer.safeTransferFrom(path[0], msg.sender, DEXQuoter.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        Transfer.safeTransferETH(to, amounts[amounts.length - 1]);
    }

    // Helper functions

    

}