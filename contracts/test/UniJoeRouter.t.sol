//SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;
pragma abicoder v2;

import "forge-std/Test.sol";
import "../src/UniJoeRouter.sol";

contract UniJoeRouterTest is Test {
	
    ISwapRouter public immutable swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
	
    address public constant WETH_ADDRESS = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address public constant USDC_ADDRESS = 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8;
	address public constant AISHIB_ADDRESS = 0xF1A82bfA7fCEb8B8741e7E04a6B8EfD348cA6393;
	UniJoeArbRouter public router;
	address deployer = makeAddr("deployer");

	function setUp() public {
		vm.createSelectFork("https://rpc.ankr.com/arbitrum", 88539014);

		vm.label(WETH_ADDRESS, "WETH");
		vm.label(USDC_ADDRESS, "USDC");
		vm.label(AISHIB_ADDRESS, "AISHIB");
		vm.label(deployer, "deployer");
		vm.label(address(swapRouter), "SwapRouter");
		
        vm.startPrank(deployer);
        vm.deal(deployer, 1001 ether);
        router = new UniJoeArbRouter{value: 1000 ether}();
	}

    function testPath() public {
		router.swapExactInputMultihopUniswap(0.1 ether, abi.encodePacked(WETH_ADDRESS, uint24(3000), USDC_ADDRESS, uint24(100), WETH_ADDRESS));
	}
}
