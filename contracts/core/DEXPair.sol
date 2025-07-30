// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './interfaces/IDEXFactory.sol';
import './interfaces/IDEXPair.sol';
import '../token/MockERC20.sol';

contract DEXPair is IDEXPair {
    function Swap(uint amount0out, uint amount1out, address to, bytes calldata data) external{

    }

    function Mint(address to) external returns (uint liquidity){

    }

    function Burn(address to) external returns (uint amount0, uint amount1){

    }

}