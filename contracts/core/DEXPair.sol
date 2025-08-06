// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './interfaces/IDEXFactory.sol';
import './interfaces/IDEXPair.sol';
import '../token/MockERC20.sol';

contract DEXPair is IDEXPair {

    address public factory;
    address public token0;
    address public token1;

    uint256 private reserve0;
    uint256 private reserve1;

    constructor() {
        factory = msg.sender;
    }

    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, "Forbidden");
        token0 = _token0;
        token1 = _token1;
    }

    function Swap(uint amount0out, uint amount1out, address to, bytes calldata data) external {

    }

    function mint(address to) external returns (uint liquidity) {
        
    }

    function Burn(address to) external returns (uint amount0, uint amount1) {

    }

    function getReserves() external view returns (uint _reserve0, uint _reserve1) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

}