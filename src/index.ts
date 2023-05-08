// 1. Import modules.
import { createPublicClient, webSocket } from 'viem'
import { arbitrum } from 'viem/chains'
import { Uniswap } from './amms/uniswap/Uniswap';
import { Price } from './amms/utils';
import { TraderJoe } from './amms/traderjoe/Traderjoe';
import { PoolGraph, buildPoolGraph, findArbitrage } from './arbitrage';
import { Pool } from './amms/Pool';
require('dotenv').config();

const MIN_USD_POOL_VALUE = 1_000;

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
    chain: arbitrum,
    transport: webSocket(process.env.RPC_URL_WS),
});

(async function () {
    console.log("Fetching and updating pool prices internally...");

    let amms = [new Uniswap(client), new TraderJoe(client)];
    let allPools: Pool[] = [];
    for (const amm of amms) {
        allPools = allPools.concat(await amm.getPoolAndLoadPrices(MIN_USD_POOL_VALUE));
    }
    let poolGraph: PoolGraph = buildPoolGraph(allPools);

    console.log(`Fetched and updated pool prices internally... (# of pools: ${allPools.length}))`);

    console.log("Listening for price changes...");
    
    for (const pool of allPools) {
        if ((pool.token0().symbol == "WETH" || pool.token1().symbol == "WETH")) {
            pool.setOnPriceChange((price: Price) => {
                findArbitrage(poolGraph, pool.token0(), pool.token1());
            });
        }
    }
})();