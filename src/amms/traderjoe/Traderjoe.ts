import axios from 'axios';
import { PublicClient } from 'viem';
import { LBPair } from './LPPair';
import { AMM, DEX } from '../Amm';
import { Pool } from '../Pool';

export class TraderJoe extends AMM<LBPair> {
    private _client: PublicClient;

    constructor(client: PublicClient) {
        super();
        this._client = client;
    }

    public async fetchAllPoolPrices(pools: LBPair[]) {
        let allPriceFunctionConfigs = pools.map(pool => pool.fetchPriceFunctionConfig());
        let results = await this._client.multicall({
            contracts: allPriceFunctionConfigs
        });
        results.forEach((result, index) => {
            if (result.status == "success" && result.result != undefined) {
                let pool = pools[index];
                pool.setPrice(result.result! as bigint);
            }
        });
    }

    public async getPools(minUSDPoolTVL: number): Promise<Pool[]> {
        const pools: Pool[] = [];
        let pageNum = 1;
        let pageSize = 25;
        let result: any;
        do {
            result = await axios.get(`https://barn.traderjoexyz.com/v1/pools/arbitrum?filterBy=1d&orderBy=liquidity&pageNum=${pageNum}&pageSize=${pageSize}&status=main`);
            for (const poolData of result.data) {
                if (poolData.liquidityUsd > minUSDPoolTVL) {
                    let token0 = { id: poolData.tokenX.address, symbol: poolData.tokenX.symbol, decimals: poolData.tokenX.decimals };
                    let token1 = { id: poolData.tokenY.address, symbol: poolData.tokenY.symbol, decimals: poolData.tokenY.decimals };
                    let pool = new LBPair(poolData.pairAddress, DEX.TRADERJOE, token0, token1, poolData.lbBaseFeePct, poolData.lbBinStep, this._client);
                    pools.push(pool);
                }
            }
            pageNum += 1;
        } while (result.data.length > 0);
        return pools;
    }
}