import { gql } from 'graphql-tag'
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { Address, PublicClient } from 'viem'
import { Token } from '../utils';
import { UniswapPool } from "./UniswapPool";
import { AMM, DEX } from '../Amm';
import { Pool } from '../Pool';

const UNIV3_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal'; //'uniswap-v3-subgraph'
const POOL_CHART = gql`
query pairs($minValue: BigDecimal=1000, $skip: Int) {
  pools(skip: $skip, first:1000, orderBy:volumeUSD, orderDirection:desc, where:{totalValueLockedUSD_gte: $minValue}) {
    id
    token0 {
      id
      decimals
      symbol
    }
    token1 {
      id
      decimals
      symbol
    }
    feeTier
  }
}
`
interface PairsResult {
  pools: {
    id: Address
    token0: {
      id: Address
      decimals: number
      symbol: string
    }
    token1: {
      id: Address
      decimals: number
      symbol: string
    }
    feeTier: number
  }[]
}

export class Uniswap extends AMM<UniswapPool> {
  private _client: PublicClient;

  constructor(client: PublicClient) {
    super();
    this._client = client;
  }
  
  public async getPools(minUSDPoolTVL: number): Promise<Pool[]> {
    const apolloClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
      uri: UNIV3_SUBGRAPH_URL,
      cache: new InMemoryCache()
    });
    
    //const pairs: { [key: string]: { [key: string]: Pool[] } } = {}
    const pools: Pool[] = []
    let skip = 0
    let result: PairsResult
  
    do {
      result = (await apolloClient.query<PairsResult>({
        query: POOL_CHART,
        variables: {
          skip,
          "minValue": minUSDPoolTVL
        },
      })).data
  
      for (const poolData of result.pools) {
        let token0: Token = { id: poolData.token0.id, symbol: poolData.token0.symbol, decimals: poolData.token0.decimals }
        let token1: Token = { id: poolData.token1.id, symbol: poolData.token1.symbol, decimals: poolData.token1.decimals }
        let feeTier: number = poolData.feeTier
        
        let pool: UniswapPool = new UniswapPool(poolData.id, DEX.UNISWAP, token0, token1, feeTier / 10000, this._client);
        pools.push(pool);
      }
      
      skip += 1000
    } while (result.pools.length > 0)
    
    return pools
  }

  public async fetchAllPoolPrices(pools: UniswapPool[]): Promise<void> {
    let allPriceFunctionConfigs = pools.map(pool => pool.fetchPriceFunctionConfig());
    let results = await this._client.multicall({
      contracts: allPriceFunctionConfigs
    });
    results.forEach((result, index) => {
      if (result.status == "success" && result.result != undefined) {
        let pool = pools[index];
        let r = result.result! as any[];
        pool.setPrice(r[0] as bigint);
      }
    });
  }
}