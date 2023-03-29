import gql from 'graphql-tag'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Address, PublicClient } from 'viem'
import { univ3PoolAbi } from './pool-abi'
const Quoter = require('@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json');

const MIN_USD_POOL_VALUE = 10000;

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

export type Pool = {
  id: Address,
  sqrtPriceX96: BigInt | undefined
  amm: string
  token0: Token
  token1: Token
  feePercentage: number
  liquidity: BigInt | undefined
}

export type Token = {
  id: Address
  symbol: string
  decimals: number
}

export async function getPools(viemClient: PublicClient, client: ApolloClient<NormalizedCacheObject>) {
  //const pairs: { [key: string]: { [key: string]: Pool[] } } = {}
  const pools: Pool[] = []
  let skip = 0
  let result: PairsResult

  do {
    console.log(`Fetching pools from ${skip} to ${skip + 1000}`)
    result = (await client.query<PairsResult>({
      query: POOL_CHART,
      variables: {
        skip,
        "minValue": MIN_USD_POOL_VALUE
      },
    })).data

    for (const pool of result.pools) {
      let token0: Token = { id: pool.token0.id, symbol: pool.token0.symbol, decimals: pool.token0.decimals }
      let token1: Token = { id: pool.token1.id, symbol: pool.token1.symbol, decimals: pool.token1.decimals }

      let feeTier: number = pool.feeTier
      pools.push({ id: pool.id, sqrtPriceX96: undefined, amm: "uniswap", token0: token0, token1: token1, feePercentage: feeTier, liquidity: undefined });
    }

    skip += 1000
  } while (result.pools.length > 0)

  return pools
}

async function getPoolFeePercentage(viemClient: PublicClient, poolId: Address): Promise<number> {
  let data: any = await viemClient.readContract({
    address: poolId,
    abi: univ3PoolAbi,
    functionName: 'fee',
    args: [],
  });
  let feePercentage: number = data * 100 / 1e6;
  return feePercentage;
}

// Get quote for a pool and a given amount of one token
export const getQuote = async (client: PublicClient, tokenIn: Address, tokenOut: Address, feePercentage: number, amountIn: BigInt) => {
  const data: any = (await client.readContract({
    address: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    abi: Quoter.abi,
    functionName: 'quoteExactInputSingle',
    args: [
      {
        type: 'address',
        value: tokenIn < tokenOut ? tokenIn : tokenOut,
      },
      {
        type: 'address',
        value: tokenIn < tokenOut ? tokenOut : tokenIn,
      },
      {
        type: 'uint24',
        value: feePercentage / 100 * 10 ** 6,
      },
      {
        type: 'uint256',
        value: amountIn,
      },
      {
        type: 'uint160',
        value: tokenIn < tokenOut ? 0 : BigInt(2) ** BigInt(160) - BigInt(1),
      },
    ],
  }));
  const amountOut: BigInt = data[0];
  return amountOut;
}