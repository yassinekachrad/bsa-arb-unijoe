// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.14;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/Path.sol";
import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";
import "@uniswap/v3-periphery/contracts/libraries/CallbackValidation.sol";
import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/SafeCast.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import "forge-std/Test.sol";

interface WETH {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function deposit() external payable;
    function withdraw(uint256 amount) external;

    function depositTo(address account) external payable;
    function withdrawTo(address account, uint256 amount) external;
}

contract UniJoeArbRouter is IUniswapV3SwapCallback {
    using Path for bytes;
    using SafeCast for uint256;

    ISwapRouter public immutable swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    address public constant factory = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
    address public constant WETH_ADDR = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    WETH public constant WETH9 = WETH(0x82aF49447D8a07e3bd95BD0d56f35241523fBab1);

    address public owner;

    struct SwapCallbackData {
        bytes path;
        address payer;
    }

    constructor() payable {
        WETH9.deposit{value: msg.value}();
        owner = msg.sender;
    }

    function setOwner(address _owner) external {
        require(msg.sender == owner, "only owner");
        owner = _owner;
    }

    receive() external payable {
        WETH9.deposit{value: msg.value}();
    }

    fallback() external payable {
        WETH9.deposit{value: msg.value}();
    }

    function deposit() external payable {
        WETH9.deposit{value: msg.value}();
    }

    function withdraw(address recipient, uint256 amount) external {
        require(msg.sender == owner, "only owner");
        WETH9.withdrawTo(recipient, amount);
    }

    function withdrawAll(address recipient) external {
        require(msg.sender == owner, "only owner");
        uint256 amount = WETH9.balanceOf(address(this));
        WETH9.withdrawTo(recipient, amount);
    }

    function getPool(address tokenA, address tokenB, uint24 fee) private view returns (IUniswapV3Pool) {
        //address addr = PoolAddress.computeAddress(factory, PoolAddress.getPoolKey(tokenA, tokenB, fee));
        address addr = IUniswapV3Factory(factory).getPool(tokenA, tokenB, fee);
        return IUniswapV3Pool(addr);
    }

    function swapExactInputMultihopUniswap(uint256 amountIn, bytes calldata path)
        external
        returns (uint256 amountOut)
    {
        // trying to simulate uniswap's router

        uint256 balanceBefore = WETH9.balanceOf(address(this));
        amountIn = amountIn > balanceBefore ? balanceBefore : amountIn;
        //TransferHelper.safeApprove(WETH_ADDR, address(swapRouter), amountIn);

        ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
            path: path,
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: 0
        });

        while (true) {
            bool hasMultiplePools = params.path.hasMultiplePools();

            // the outputs of prior swaps become the inputs to subsequent ones
            params.amountIn = exactInputInternal(
                params.amountIn,
                params.recipient, // for intermediate swaps, this contract custodies
                0,
                SwapCallbackData({
                    path: params.path.getFirstPool(), // only the first pool in the path is necessary
                    payer: address(this)
                })
            );

            // decide whether to continue or terminate
            if (hasMultiplePools) {
                params.path = params.path.skipToken();
            } else {
                amountOut = params.amountIn;
                break;
            }
        }


        uint256 balanceAfter = WETH9.balanceOf(address(this));
        require(balanceAfter >= balanceBefore, "NO_ARB");
    }

    function exactInputInternal(
        uint256 amountIn,
        address recipient,
        uint160 sqrtPriceLimitX96,
        SwapCallbackData memory data
    ) private returns (uint256 amountOut) {
        // allow swapping to the router address with address 0
        if (recipient == address(0)) recipient = address(this);

        (address tokenIn, address tokenOut, uint24 fee) = data.path.decodeFirstPool();

        bool zeroForOne = tokenIn < tokenOut;

        (int256 amount0, int256 amount1) = getPool(tokenIn, tokenOut, fee).swap(
            recipient,
            zeroForOne,
            amountIn.toInt256(),
            sqrtPriceLimitX96 == 0
                ? (zeroForOne ? TickMath.MIN_SQRT_RATIO + 1 : TickMath.MAX_SQRT_RATIO - 1)
                : sqrtPriceLimitX96,
            abi.encode(data)
        );

        return uint256(-(zeroForOne ? amount1 : amount0));
    }

    function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes calldata _data) external override {
        require(amount0Delta > 0 || amount1Delta > 0, "swaps entirely within 0-liquidity regions are not supported"); // swaps entirely within 0-liquidity regions are not supported
        SwapCallbackData memory data = abi.decode(_data, (SwapCallbackData));
        (address tokenIn, address tokenOut, uint24 fee) = data.path.decodeFirstPool();
        require(msg.sender == address(getPool(tokenIn, tokenOut, fee)));

        (bool isExactInput, uint256 amountToPay) =
            amount0Delta > 0 ? (tokenIn < tokenOut, uint256(amount0Delta)) : (tokenOut < tokenIn, uint256(amount1Delta));

        if (isExactInput) {
            pay(tokenIn, data.payer, msg.sender, amountToPay);
        } else {
            // either initiate the next swap or pay
            /*if (data.path.hasMultiplePools()) {
                data.path = data.path.skipToken();
                exactOutputInternal(amountToPay, msg.sender, 0, data);
            } else {
                amountInCached = amountToPay;
                tokenIn = tokenOut; // swap in/out because exact output swaps are reversed
                pay(tokenIn, data.payer, msg.sender, amountToPay);
            }*/
        }
    }

    function pay(address token, address payer, address recipient, uint256 value) internal {
        if (token == WETH_ADDR && address(this).balance >= value) {
            // pay with WETH9
            WETH9.deposit{value: value}(); // wrap only what is needed to pay
            WETH9.transfer(recipient, value);
        } else if (payer == address(this)) {
            // pay with tokens already in the contract (for the exact input multihop case)
            TransferHelper.safeTransfer(token, recipient, value);
        } else {
            // pull payment
            TransferHelper.safeTransferFrom(token, payer, recipient, value);
        }
    }
}
