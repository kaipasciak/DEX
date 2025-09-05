// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './interfaces/IDEXFactory.sol';
import './interfaces/IDEXPair.sol';
import '../token/MockERC20.sol';
import '../libraries/Math.sol';
import '../libraries/Transfer.sol';

contract DEXPair is IDEXPair {

    uint public constant MINIMUM_LIQUIDITY = 10**3;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    address public factory;
    address public token0;
    address public token1;

    uint  public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    uint112 private reserve0;
    uint112 private reserve1;

    uint public price0;
    uint public price1;

    // Lock for certain operations to finish before others are started
    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'Error: Locked');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor() {
        factory = msg.sender;
    }

    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, "Forbidden");
        token0 = _token0;
        token1 = _token1;
    }

    function swap(uint amount0Out, uint amount1Out, address to) external lock {
        require(amount0Out > 0 || amount1Out > 0, 'Error: Insufficient amount');
        (uint112 _reserve0, uint112 _reserve1) = getReserves();
        require(amount0Out < _reserve0 && amount1Out < _reserve1, 'Error: Insufficient Liquidity');

        uint balance0;
        uint balance1;
        {
            address _token0 = token0;
            address _token1 = token1;
            require(to != _token0 && to != _token1, 'Error: Invalid to');
            if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out); 
            if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out); 
            balance0 = MockERC20(_token0).balanceOf(address(this));
            balance1 = MockERC20(_token1).balanceOf(address(this));
        }
        uint amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, 'Error: Insufficient amount');
        
        {
        uint balance0Adjusted = (balance0 * 1000) - (amount0In * 3);
        uint balance1Adjusted = (balance1 * 1000) - (amount1In * 3);
        require(balance0Adjusted * balance1Adjusted >= (uint(_reserve0) * uint(_reserve1) * 1000**2), 'Error: K');
        }

        _update(balance0, balance1);
    }

    function mint(address to) external lock returns (uint liquidity) {
        (uint112 _reserve0, uint112 _reserve1) = getReserves();
        uint balance0 = MockERC20(token0).balanceOf(address(this));
        uint balance1 = MockERC20(token1).balanceOf(address(this));
        uint amount0 = balance0 - _reserve0;
        uint amount1 = balance1 - _reserve1;

        uint _totalSupply = totalSupply;
        // Enforce minimum liquidity for security
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            liquidity = Math.min((amount0 * _totalSupply) / _reserve0, (amount1 * _totalSupply) / _reserve1);
        }
        require(liquidity > 0, 'Error: Insufficient Liquidity');
        _mint(to, liquidity);

        _update(balance0, balance1);
        // emit Min(msg.sender, amount0, amount1);
    }

    function _mint(address to, uint value) internal {
        totalSupply = totalSupply + value;
        balanceOf[to] = balanceOf[to] + value;
        // emit Transfer(address(0), to, value);
    }

    function _update(uint balance0, uint balance1) private {
        // Workaround for older version of uniswap
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, "Error: Overflow");
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        price0 = reserve0 > 0 ? (uint256(reserve1) * 1e18) / reserve0 : 0;
        price1 = reserve1 > 0 ? (uint256(reserve0) * 1e18) / reserve1 : 0;
        // emit Sync(reserve0, reserve1);
    }

    function burn(address to) external lock returns (uint amount0, uint amount1) {
        
        address _token0 = token0;                           
        address _token1 = token1;

        uint balance0 = MockERC20(_token0).balanceOf(address(this));
        uint balance1 = MockERC20(_token1).balanceOf(address(this));
        uint liquidity = balanceOf[address(this)];

        uint _totalSupply = totalSupply;
        amount0 = (liquidity * balance0) / _totalSupply;
        amount1 = (liquidity * balance1) / _totalSupply;
        require(amount0 > 0 && amount1 > 0, 'Error: Insufficient liquidity burned');
        _burn(address(this), liquidity);
        _safeTransfer(_token0, to, amount0);
        _safeTransfer(_token1, to, amount1);
        balance0 = MockERC20(_token0).balanceOf(address(this));
        balance1 = MockERC20(_token1).balanceOf(address(this));

        _update(balance0, balance1);
    }

    function _burn(address from, uint value) internal {
        balanceOf[from] = balanceOf[from] - value;
        totalSupply = totalSupply - value;
    }

    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

    function transferFrom(address from, address to, uint value) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max && allowance[from][msg.sender] >= value) {
            allowance[from][msg.sender] = allowance[from][msg.sender] - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint value) private {
        balanceOf[from] = balanceOf[from]- value;
        balanceOf[to] = balanceOf[to] + value;
        // emit Transfer(from, to, value);
    }

    function _safeTransfer(address token, address to, uint value) private {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'Error: Transfer Failed');
    }

}