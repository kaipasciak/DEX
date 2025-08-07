// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library Math{
    function min(uint x, uint y) internal pure returns (uint z) {
        z = x < y ? x : y;
    }

    function sqrt(uint x) internal pure returns (uint y) {
            uint z = (x + 1) / 2;
            y = x;
            while (z < y) {
                y = z;
                z = (x / z + z) / 2;
            }
        }
}