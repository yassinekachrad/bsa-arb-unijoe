import { Address } from "viem";
import { Token, TokenAmount, readablePrice } from "./amms/utils";
import { Pool } from "./amms/Pool";

const DEFAULT_SIZE = 10;
const DEFAULT_SIZES: Map<String, number> = new Map(Object.entries({
    WETH: 0.025,
    USDC: 50,
    USDT: 50,
    DAI: 50,
    ARB: 50,
    WBTC: 0.002,
}));

// map to map to pool
export type PoolGraph = {
    [token0: Address]: { [token1: Address]: Pool[] };
}

let busy = false;

// TODO: Make a function to look for arbitrage opportunities from the lists of pools (simple uniswap <-> traderjoe arbitrage)
export const findArbitrage = async (poolGraph: PoolGraph, token0: Token, token1: Token) => {
    /*while (busy) {
        await new Promise(f => setTimeout(f, 500));
        //return;
    }*/
    busy = true;
    const pools = poolGraph[token0.id][token1.id];
    if (pools.length > 0) {
        //console.log("Searching for an arbitrage opportunity between " + token0.symbol + " and " + token1.symbol);
        let maxPrice = pools[0].price();
        let maxPool = pools[0];
        let minPrice = pools[0].price();
        let minPool = pools[0];
        for (const pool of pools) {
            //console.log(pool.toString());
            if (pool.price().rawPrice > maxPrice.rawPrice) {
                maxPrice.rawPrice = pool.price().rawPrice;
                maxPool = pool;
            }
            if (pool.price().rawPrice < minPrice.rawPrice) {
                minPrice.rawPrice = pool.price().rawPrice;
                minPool = pool;
            }
        }

        if (maxPool.id() !== minPool.id()) {

            /*try {
                let initialAmount = new TokenAmount(token0, BigInt(10 ** token0.decimals / 10));
                let maxQuoteAmountOut = await maxPool.getQuoteAmountOut(initialAmount);
                let minQuoteAmountOut = await minPool.getQuoteAmountOut(maxQuoteAmountOut);
                let rawProfit = BigInt(minQuoteAmountOut.amount.toString()) - BigInt(initialAmount.amount.toString());
                let profit = new TokenAmount(token0, rawProfit);
                console.log(`Initial size: ${initialAmount.toString()} -> ${maxQuoteAmountOut.toString()} -> ${minQuoteAmountOut.toString()} | Profit: ${profit.toString()}`)
            } catch {
                console.log("Error");
            }*/
            const tokenIn = token1.symbol == "WETH" ? token1 : token0; // We want to start with WETH
            const tokenIntermediate = token1.symbol == "WETH" ? token0 : token1;
            const newMaxPool = tokenIn.symbol == maxPool.token0().symbol ? maxPool : minPool;
            const newMinPool = tokenIn.symbol == maxPool.token0().symbol ? minPool : maxPool;
            const size = DEFAULT_SIZES.get(tokenIn.symbol) || DEFAULT_SIZE;
            const initialAmount = new TokenAmount(tokenIn, BigInt(size*10**tokenIn.decimals));

            let profit = await simulateArb2(initialAmount, newMaxPool, newMinPool, tokenIn, tokenIntermediate);
            if (profit.amount > BigInt(0)) {
                let optimalSize = await findOptimalSize(initialAmount, newMaxPool, newMinPool, tokenIn, tokenIntermediate);
                console.log("----------------------------------------")
                //console.log("Optimal size found: " + optimalSize.toString());
            } else {
                //console.log("No arbitrage opportunity found");
            }
        } else {
            //console.log("No arbitrage opportunity found");
        }
    }
    busy = false;
}

const simulateArb = async (size: number, maxPool: Pool, minPool: Pool, token0: Token, token1: Token) => {
    try {
        let initialAmount = new TokenAmount(token0, BigInt(size * 10 ** token0.decimals));
        let maxQuoteAmountOut = await maxPool.getQuoteAmountOut(initialAmount);
        let minQuoteAmountOut = await minPool.getQuoteAmountOut(maxQuoteAmountOut);
        let rawProfit = BigInt(minQuoteAmountOut.amount.toString()) - BigInt(initialAmount.amount.toString());
        let profit = new TokenAmount(token0, rawProfit);
        if (profit.amount > 0) {
            console.log(`${initialAmount.toString()} -> ${maxQuoteAmountOut.toString()} -> ${minQuoteAmountOut.toString()} | Profit: ${profit.toString()}`);
        }
        return profit;
    } catch {
        console.log("Error");
    }
    return new TokenAmount(token0, BigInt(NaN));
}

const simulateArb2 = async (initialAmount: TokenAmount, maxPool: Pool, minPool: Pool, tokenIn: Token, tokenIntermediate: Token) => {
    try {
        let maxQuoteAmountOut = await maxPool.getQuoteAmountOut(initialAmount);
        let minQuoteAmountOut = await minPool.getQuoteAmountOut(maxQuoteAmountOut);
        let rawProfit = BigInt(minQuoteAmountOut.amount.toString()) - BigInt(initialAmount.amount.toString());
        let profit = new TokenAmount(tokenIn, rawProfit);
        //if (profit.amount > 0) {
              //console.log(`${initialAmount.toString()} -> ${maxQuoteAmountOut.toString()} -> ${minQuoteAmountOut.toString()} | Profit: ${profit.toString()}`);
        //}
        return profit;
    } catch {
        console.log("Error");
    }
    return new TokenAmount(tokenIn, BigInt(NaN));
}

const findOptimalSize = async (initialAmount: TokenAmount, maxPool: Pool, minPool: Pool, tokenIn: Token, tokenIntermediate: Token) => {
    // TODO: converge to the optimal size
    let size = initialAmount;
    let previousProfit = new TokenAmount(tokenIn, BigInt(0));
    let profit = await simulateArb2(size, maxPool, minPool, tokenIn, tokenIntermediate);

    for (let currentFactor = 5; currentFactor > 1.1; currentFactor = Math.sqrt(currentFactor)) {
        do {
            size.amount = BigInt(parseFloat(size.amount.toString()) * currentFactor);
            previousProfit = profit;
            profit = await simulateArb2(size, maxPool, minPool, tokenIn, tokenIntermediate);
        } while (profit.amount > previousProfit.amount);
        profit = previousProfit;
        size.amount = BigInt(parseFloat(size.amount.toString()) / currentFactor);
    }
    console.log(`Optimal Size: ${size.toString()} | Max profit: ${profit.toString()}\n \
     ${maxPool.toString()} -> ${minPool.toString()}`);
    return size;
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