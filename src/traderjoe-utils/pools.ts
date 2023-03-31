import { AMM, Pool } from '../utils';
// https request client import
import axios from 'axios';
import { PublicClient } from 'viem';

// Call https://barn.traderjoexyz.com/v1/pools/arbitrum?filterBy=1d&orderBy=liquidity&pageNum=1&pageSize=25&status=unverified to get the list of pools and construct a list of pools
export async function getTraderJoePools(minUSDPoolTVL: number): Promise<Pool[]> {
    const pools: Pool[] = [];
    let pageNum = 1;
    let pageSize = 25;
    let result: any;
    do {
        result = await axios.get(`https://barn.traderjoexyz.com/v1/pools/arbitrum?filterBy=1d&orderBy=liquidity&pageNum=${pageNum}&pageSize=${pageSize}&status=unverified`);
        for (const pool of result.data) {
            console.log(pool.tokenX.symbol, pool.tokenY.symbol, pool.liquidityUsd)
            if (pool.liquidityUsd > minUSDPoolTVL) {
                let newPool: Pool = {
                    id: pool.pairAddress,
                    sqrtPriceX96: undefined,
                    amm: AMM.TRADERJOE,
                    token0: {
                        id: pool.tokenX.address,
                        symbol: pool.tokenX.symbol,
                        decimals: pool.tokenX.decimals
                    },
                    token1: {
                        id: pool.tokenY.address,
                        symbol: pool.tokenY.symbol,
                        decimals: pool.tokenY.decimals
                    },
                    feePercentage: pool.lbBaseFeePct,
                }

                // TODO: fix those functions
                /*newPool.fetchPoolPrice = async (client: PublicClient) => {
                    const data: any = (await client.readContract({
                        address: pool.pairAddress,
                        abi: traderJoePoolAbi,
                        functionName: "getPrice",
                        args: []
                    }));
                    newPool.sqrtPriceX96 = BigInt(data);
                }*/

                /*newPool.quoteAmountOut = async (client: PublicClient, amountIn: BigInt, tokenIn: any): Promise<BigInt> => {
                    const data: any = (await client.readContract({
                        address: pool.pairAddress,
                        abi: traderJoePoolAbi,
                        functionName: "getPrice",
                        args: []
                    }));*/
                pools.push(newPool);
            }
        }
        pageNum += 1;
    } while (result.data.length > 0);
    return pools;
}