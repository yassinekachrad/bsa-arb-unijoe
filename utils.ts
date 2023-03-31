import { Address, PublicClient } from "viem"

export enum AMM {
  UNISWAP = "uniswap",
  TRADERJOE = "traderjoe"
}

export interface Pool {
  id: Address,
  sqrtPriceX96: BigInt | undefined
  amm: string
  token0: Token
  token1: Token
  feePercentage: number
  fetchPoolPrice?(client: PublicClient): void
  quoteAmountOut?(client: PublicClient, amountIn: TokenAmount): Promise<TokenAmount>
}

export type Token = {
  id: Address
  symbol: string
  decimals: number
}

export type TokenAmount = {
  token: Token
  amount: BigInt
}

export const displayTokenAmount = function (tokenAmount: TokenAmount) {
  return parseFloat(tokenAmount.amount.toString()) / 10 ** tokenAmount.token.decimals;
}


// Convert a sqrtPriceX96 to a price
export const sqrtPriceToPrice = (sqrtPriceX96: BigInt, token0: Token, token1: Token) => {
  let sqrtPrice = parseFloat(sqrtPriceX96.toString()) / parseFloat((BigInt(2) ** BigInt(96)).toString());
  let price = sqrtPrice * sqrtPrice / 10 ** (token1.decimals - token0.decimals);
  return price;
}

// Pretty print pool data
export const printPoolData = (pool: Pool) => {
  console.log(`Pool (${pool.amm.toUpperCase()}) ${pool.id.substring(0, 4)}...${pool.id.substring(pool.id.length - 4, pool.id.length)}: ${pool.token0.symbol}/${pool.token1.symbol} ${pool.feePercentage}% has price ${pool.sqrtPriceX96 !== undefined ? sqrtPriceToPrice(pool.sqrtPriceX96!, pool.token0, pool.token1).toFixed(6) : "undefined"}`);
}