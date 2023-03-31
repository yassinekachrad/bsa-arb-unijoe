// 1. Import modules.
import { Address, createPublicClient, http, PublicClient, webSocket, decodeAbiParameters } from 'viem'
import { mainnet, arbitrum } from 'viem/chains'
import { getUniswapPools, getQuote as UniV3getQuote } from './uniswap-utils/pools';
import { univ3PoolAbi } from './uniswap-utils/pool-abi';
import { AMM, displayTokenAmount, Pool, printPoolData, Token, TokenAmount } from './utils';
import { getTraderJoePools } from './traderjoe-utils/pools';
require('dotenv').config();

const MIN_USD_POOL_VALUE = 1000;

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
    chain: arbitrum,
    transport: webSocket(process.env.RPC_URL_WS),
});

(async function () {

    // ------------------ Uniswap ------------------
    // get pools
    const uniswapPools: Pool[] = await getUniswapPools(MIN_USD_POOL_VALUE);

    console.log(`Number of interesting uniswap pools: ${Object.keys(uniswapPools).length}`);

    // get the price of each pool and put them in a dictionary
    for (const pool of uniswapPools) {
        if (pool.fetchPoolPrice !== undefined) await pool.fetchPoolPrice(client);
    }

    console.log("Uniswap Pool data fetched. Subscribing to swap events...");
    
    // (uniswap) Subscribe to price updates
    for (const pool of uniswapPools) {
        const unwatch = client.watchContractEvent({
            address: pool.id,
            abi: univ3PoolAbi,
            eventName: 'Swap',
            onLogs: logs => onSwapEventUniswap(logs, pool, client),
        });
    }

    // ------------------ TraderJoe ------------------
    // get pools
    const traderJoePools: Pool[] = await getTraderJoePools(MIN_USD_POOL_VALUE);

    console.log(`Number of interesting traderjoe pools: ${Object.keys(traderJoePools).length}`);

    // get the price of each pool and put them in a dictionary
    for (const pool of traderJoePools) {
        if (pool.fetchPoolPrice !== undefined) await pool.fetchPoolPrice(client);
    }

    console.log("TraderJoe Pool data fetched. Subscribing to swap events...");
    
    // (traderjoe) Subscribe to price updates
    for (const pool of traderJoePools) {
        // TODO: Add swap event subscription
    }

    // dictionary token0 -> token1 -> pool[] (for arbitrage search)
    let poolsGraph: { [token0: string]: { [token1: string]: Pool[] } } = {};

    // add uniswap pools to the graph
    for (const pool of uniswapPools) {
        if (!(pool.token0.symbol in poolsGraph)) poolsGraph[pool.token0.symbol] = {};
        if (!(pool.token1.symbol in poolsGraph[pool.token0.symbol])) poolsGraph[pool.token0.symbol][pool.token1.symbol] = [];
        poolsGraph[pool.token0.symbol][pool.token1.symbol].push(pool);
    }

    // add traderjoe pools to the graph
    for (const pool of traderJoePools) {
        if (!(pool.token0.symbol in poolsGraph)) poolsGraph[pool.token0.symbol] = {};
        if (!(pool.token1.symbol in poolsGraph[pool.token0.symbol])) poolsGraph[pool.token0.symbol][pool.token1.symbol] = [];
        poolsGraph[pool.token0.symbol][pool.token1.symbol].push(pool);
    }

    // test quote uniswap USDT -> USDC (fee 0.3%)
    let pools: Pool[];
    if ((pools = poolsGraph['USDT']['USDC'].filter(pool => pool.feePercentage == 0.01 && pool.amm == AMM.UNISWAP && pool.quoteAmountOut !== undefined)).length == 1) {
        const pool = pools[0];
        const tokenIn = pool.token0.symbol == 'USDT' ? pool.token0 : pool.token1;
        const tokenAmountIn: TokenAmount = {token: tokenIn, amount: BigInt(1 * 10 ** tokenIn.decimals)};
        const quote = await pool.quoteAmountOut!(client, tokenAmountIn);
        console.log(`Quote ${displayTokenAmount(tokenAmountIn)} USDT -> ${displayTokenAmount(quote)} USDC`);
    }
     else {
        console.log(poolsGraph['USDT']['USDC']);
     }
})();

const onSwapEventUniswap = async (logs: any, pool: Pool, client: PublicClient) => {
    // Decode the event log.
    const eventData = decodeAbiParameters(
        [
            { name: 'amount0', type: 'int256' },
            { name: 'amount1', type: 'int256' },
            { name: 'sqrtPriceX96', type: 'uint160' },
            { name: 'liquidity', type: 'uint128' },
            { name: 'tick', type: 'int24' },
        ],
        logs[0].data);
    pool.sqrtPriceX96 = eventData[2];
    printPoolData(pool);
}

// TODO: Make a function to look for arbitrage opportunities from the lists of pools (simple uniswap <-> traderjoe arbitrage)