// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './MockERC20.sol';
import '../periphery/interfaces/IWETH.sol';


// From WETH Smart Contract
// 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
contract MockWETH is IWETH {
    string public name     = "Wrapped Ether";
    string public symbol   = "WETH";
    uint8  public decimals = 18;

    mapping (address => uint) public  balanceOf;
    mapping (address => mapping (address => uint)) public  allowance;

    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        // Deposit(msg.sender, msg.value);
    }
    function withdraw(uint wad) public {
        require(balanceOf[msg.sender] >= wad);
        balanceOf[msg.sender] -= wad;
        payable(msg.sender).transfer(wad);
        // Withdrawal(msg.sender, wad);
    }

    function transfer(address dst, uint wad) public returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(address src, address dst, uint wad)
        public
        returns (bool)
    {
        require(balanceOf[src] >= wad);

        if (src != msg.sender && allowance[src][msg.sender] != type(uint256).max) {
            require(allowance[src][msg.sender] >= wad);
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;

        // Transfer(src, dst, wad);

        return true;
    }
}