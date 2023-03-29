// 1. Import modules.
import { Address, createPublicClient, http, PublicClient, webSocket, decodeAbiParameters } from 'viem'
import { mainnet, arbitrum } from 'viem/chains'
import { getPools, Pool, getQuote as UniV3getQuote, Token } from './uniswap-utils/pools';
import { ApolloClient, NormalizedCacheObject, InMemoryCache } from '@apollo/client';
import { univ3PoolAbi } from './uniswap-utils/pool-abi';

require('dotenv').config();

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
    chain: arbitrum,
    transport: webSocket(process.env.RPC_URL_WS),
});

// Create Apollo Client
const apolloClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal',
    cache: new InMemoryCache()
});

// Update the price of a pool
const updatePoolPrice = async (pool: Pool, client: PublicClient) => {
    const data: any = (await client.readContract({
        address: pool.id,
        abi: univ3PoolAbi,
        functionName: 'slot0',
    }));
    const sqrtPriceX96: BigInt = data[0];
    pool.sqrtPriceX96 = sqrtPriceX96;
}

(async function () {
    // get pools
    const POOLS: Pool[] = await getPools(client, apolloClient);

    console.log(`Number of interesting pools: ${Object.keys(POOLS).length}`);

    // get the price of each pool and put them in a dictionary
    for (const pool of POOLS) {
        await updatePoolPrice(pool, client);
    }

    console.log("Pool data fetched. Subscribing to price updates...");

    // Subscribe to price updates
    for (const pool of POOLS) {
        const unwatch = client.watchContractEvent({
            address: pool.id,
            abi: univ3PoolAbi,
            eventName: 'Swap',
            onLogs: logs => reactToPriceChange(logs, pool, client),
        });
    }
})();

// 3. Define a function to react to price changes.
const reactToPriceChange = async (logs: any, pool: Pool, client: PublicClient) => {


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
    pool.liquidity = eventData[3];
    
    printPoolData(pool);
}

// Convert a sqrtPriceX96 to a price
const sqrtPriceToPrice = (sqrtPriceX96: BigInt, token0: Token, token1: Token) => {
    let sqrtPrice = parseFloat(sqrtPriceX96.toString()) / parseFloat((BigInt(2)**BigInt(96)).toString());
    let price = sqrtPrice * sqrtPrice / 10**(token1.decimals - token0.decimals);
    return price;
}

// Pretty print pool data
const printPoolData = (pool: Pool) => {
    console.log(`Pool ${pool.id} (${pool.token0.symbol}/${pool.token1.symbol}) has price ${sqrtPriceToPrice(pool.sqrtPriceX96!, pool.token0, pool.token1).toFixed(6)}`);
}