import { gql } from 'graphql-tag'
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { Address, getAccount, isAddress, PublicClient } from 'viem'
import { univ3PoolAbi } from './pool-abi'
import { AMM, Pool, Token, TokenAmount } from '../utils';

const Quoter = require('@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json');

const QUOTER_ADDRESS: Address = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
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

export async function getUniswapPools(minUSDPoolTVL: number) {
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

    for (const pool of result.pools) {
      let token0: Token = { id: pool.token0.id, symbol: pool.token0.symbol, decimals: pool.token0.decimals }
      let token1: Token = { id: pool.token1.id, symbol: pool.token1.symbol, decimals: pool.token1.decimals }
      let feeTier: number = pool.feeTier

      let newPool: Pool = { id: pool.id, sqrtPriceX96: undefined, amm: AMM.UNISWAP, token0: token0, token1: token1, feePercentage: feeTier / 10000 }

      newPool.fetchPoolPrice = async (client: PublicClient) => {
        const data: any = (await client.readContract({
          address: pool.id,
          abi: univ3PoolAbi,
          functionName: 'slot0',
        }));
        const sqrtPriceX96: BigInt = data[0];
        newPool.sqrtPriceX96 = sqrtPriceX96;
      }

      newPool.quoteAmountOut = async (client: PublicClient, amountIn: TokenAmount) => {
        if (amountIn.token.id == token0.id || amountIn.token.id == token1.id) {
          return getQuote(client, token0, token1, feeTier, amountIn.amount)
        } else {
          throw new Error("Token not in pool");
        }
      }

      pools.push(newPool);
    }

    skip += 1000
  } while (result.pools.length > 0)

  return pools
}

// Get quote for a pool and a given amount of one token
export const getQuote = async (client: PublicClient, tokenIn: Token, tokenOut: Token, feeTier: number, amountIn: BigInt): Promise<TokenAmount> => {


  const data: any = (await client.simulateContract({
    address: QUOTER_ADDRESS,
    abi: Quoter.abi,
    functionName: 'quoteExactInputSingle',
    args: [
      {
        "tokenIn": tokenIn.id,
        "tokenOut": tokenOut.id,
        "fee": feeTier,
        "amountIn": amountIn,
        "sqrtPriceLimitX96": 0
      }
    ]
  }));
  return { token: tokenOut, amount: data.result[0] };
}

/*async function getPoolFeePercentage(viemClient: PublicClient, poolId: Address): Promise<number> {
  let data: any = await viemClient.readContract({
    address: poolId,
    abi: univ3PoolAbi,
    functionName: 'fee',
    args: [],
  });
  let feePercentage: number = data * 100 / 1e6;
  return feePercentage;
}*/