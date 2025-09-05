// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IWETH {
    function deposit() external payable;
    function transfer(address dst, uint wad) external returns (bool);
    function withdraw(uint256) external;
    function transferFrom(address src, address dst, uint wad) external returns (bool);
    function approve(address guy, uint wad) external returns (bool);
}