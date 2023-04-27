// 1. Import modules.
import { createPublicClient, PublicClient, webSocket, decodeAbiParameters, getContract } from 'viem'
import { arbitrum } from 'viem/chains'
import { Uniswap } from './amms/uniswap-utils/pools';
import { univ3PoolAbi } from './amms/uniswap-utils/pool-abi';
import { AMM, Pool, Price, Token, TokenAmount } from './amms/utils';
import { TraderJoe } from './amms/traderjoe-utils/pools';
import { PoolGraph, buildPoolGraph, findArbitrage } from './arbitrage';
require('dotenv').config();

const MIN_USD_POOL_VALUE = 1000;

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
    chain: arbitrum,
    transport: webSocket(process.env.RPC_URL_WS),
});

(async function () {
    // ------------------ Uniswap ------------------

    let amms = [new Uniswap(client), new TraderJoe(client)];
    let allPools: Pool[] = [];

    for (const amm of amms)
        allPools = allPools.concat(await amm.getPools(MIN_USD_POOL_VALUE));

    let poolGraph: PoolGraph = buildPoolGraph(allPools);
    
    for (const pool of allPools) {
        if ((pool.token0().symbol == "WETH" || pool.token1().symbol == "WETH")
        && (pool.token0().symbol == "USDC" || pool.token1().symbol == "USDC")) {
            pool.setOnPriceChange((price: Price) => {
                findArbitrage(poolGraph, pool.token0(), pool.token1());
            });
        }
    }
})();