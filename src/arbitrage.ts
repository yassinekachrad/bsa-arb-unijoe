import { Address } from "viem";
import { Pool, Token, TokenAmount, readablePrice } from "./amms/utils";

// map to map to pool
export type PoolGraph = {
    [token0: Address]: {[token1: Address]: Pool[]};
}

let working = false;

// TODO: Make a function to look for arbitrage opportunities from the lists of pools (simple uniswap <-> traderjoe arbitrage)
export const findArbitrage = async (poolGraph: PoolGraph, token0: Token, token1: Token) => {
    if (working) {
        return;
    }
    working = true;
    const pools = poolGraph[token0.id][token1.id];
    if (pools.length > 0) {
        console.log("Searching for an arbitrage opportunity between " + token0.symbol + " and " + token1.symbol);
        let maxPrice = pools[0].price();
        let maxPool = pools[0];
        let minPrice = pools[0].price();
        let minPool = pools[0];
        for (const pool of pools) {
            console.log(pool.toString());
            if (pool.price().rawPrice > maxPrice.rawPrice) {
                maxPrice.rawPrice = pool.price().rawPrice;
                maxPool = pool;
            }
            if (pool.price().rawPrice < minPrice.rawPrice) {
                minPrice.rawPrice = pool.price().rawPrice;
                minPool = pool;
            }
        }
        console.log(`Max price: ${readablePrice(maxPrice)} | Min price: ${readablePrice(minPrice)}`);
        console.log("--------------------------------------------------");
        
        if (maxPool.id() !== minPool.id()) {
            let initialAmount = new TokenAmount(token0, BigInt(10 ** token0.decimals / 10));
            let maxQuoteAmountOut = await maxPool.getQuoteAmountOut(initialAmount);
            let minQuoteAmountOut = await minPool.getQuoteAmountOut(maxQuoteAmountOut);
            let rawProfit = BigInt(minQuoteAmountOut.amount.toString()) - BigInt(initialAmount.amount.toString());
            let profit = new TokenAmount(token0, rawProfit);
            console.log(`Initial size: ${initialAmount.toString()} -> ${maxQuoteAmountOut.toString()} -> ${minQuoteAmountOut.toString()} | Profit: ${profit.toString()}`)
        }
    }
    working = false;
}

export const buildPoolGraph = (pools: Pool[]): PoolGraph => {
    let poolGraph: PoolGraph = {};
    for (const pool of pools) {
        if (!(pool.token0().id in poolGraph)) {
            poolGraph[pool.token0().id] = {};
        }
        if (!(pool.token1().id in poolGraph[pool.token0().id])) {
            poolGraph[pool.token0().id][pool.token1().id] = [];
        }
        poolGraph[pool.token0().id][pool.token1().id].push(pool);
    }
    return poolGraph;
}