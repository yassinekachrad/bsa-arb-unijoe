import { gql } from 'graphql-tag'
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { Address, decodeAbiParameters, getContract, PublicClient } from 'viem'
import { univ3PoolAbi } from './pool-abi'
import { AMM, DEX, Pool, Price, Token, TokenAmount, readablePrice } from '../utils';

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

export class UniswapPool extends Pool {
  private _id: Address;
  private _sqrtPriceX96: BigInt | undefined;
  private _dex: DEX;
  private _token0: Token;
  private _token1: Token;
  private _feePercentage: number;

  private _client: PublicClient;
  private _contract;
  private _quoter;
    
  constructor(id: Address, dex: DEX, token0: Token, token1: Token, feePercentage: number, client: PublicClient) {
    super();
    this._id = id;
    this._dex = dex;
    this._token0 = token0;
    this._token1 = token1;
    this._feePercentage = feePercentage;
    this._client = client;
    this._contract = getContract({address: id, abi: univ3PoolAbi, publicClient: client});
    
    this._quoter = getContract({address: QUOTER_ADDRESS, abi: Quoter.abi, publicClient: this._client});
  }

  // Getters
  public id() {return this._id};
  public dex() {return this._dex};
  public token0() {return this._token0};
  public token1() {return this._token1};
  public feePercentage() {return this._feePercentage};
  public price() {
    return this._sqrtPriceX96 !== undefined ? 
      sqrtPriceToPrice(this._sqrtPriceX96, this._token0, this._token1) : 
      {token: this._token0, quote: this._token1, rawPrice: NaN};
  };

  public async getQuoteAmountOut(amountIn: TokenAmount): Promise<TokenAmount> {
    const tokenIn = amountIn.token;
    const tokenOut = amountIn.token.id == this.token0().id ? this.token1() : this.token0();
    const result = await this._quoter.simulate.quoteExactInputSingle([{tokenIn: tokenIn.id, tokenOut: tokenOut.id, fee: this.feePercentage()*10000, amountIn: amountIn.amount, sqrtPriceLimitX96: 0}]);
    const amountOut: any = result.result[0];
    return new TokenAmount(this.token1(), amountOut);
  }

  public async fetchPoolPrice(): Promise<Price> {
    this._contract.read.slot0().then((data: any) => {
      const sqrtPriceX96: BigInt = data[0];
      this._sqrtPriceX96 = sqrtPriceX96;
    })
    return this.price();
  }

  public async setOnPriceChange(callback: (price: Price) => void): Promise<void> {
    let current = this;
    this._contract.watchEvent.Swap(
      {},
      {
        onLogs(logs: any) {
          const eventData = decodeAbiParameters(
            [
              { name: 'amount0', type: 'int256' },
              { name: 'amount1', type: 'int256' },
              { name: 'sqrtPriceX96', type: 'uint160' },
              { name: 'liquidity', type: 'uint128' },
              { name: 'tick', type: 'int24' },
            ],
            logs[0].data);
          current._sqrtPriceX96 = BigInt(eventData[2]);
          callback(current.price());
        }
      }
    )
  }
}

export class Uniswap implements AMM {
  private _client: PublicClient;

  constructor(client: PublicClient) {
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
}

const sqrtPriceToPrice = (sqrtPriceX96: BigInt, token0: Token, token1: Token) => {
  let sqrtPrice = parseFloat(sqrtPriceX96.toString()) / parseFloat((BigInt(2) ** BigInt(96)).toString());
  return {token: token0, quote: token1, rawPrice: sqrtPrice ** 2};
}