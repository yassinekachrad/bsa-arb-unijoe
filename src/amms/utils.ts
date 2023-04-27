import { Address, PublicClient } from "viem"

export enum DEX {
  UNISWAP = "uniswap",
  TRADERJOE = "traderjoe"
}

export interface AMM {
  getPools(minUSDPoolTVL: number): Promise<Pool[]>;
}

export abstract class Pool {
  abstract id(): Address
  //sqrtPriceX96: BigInt | undefined
  abstract price(): Price // user readable price
  abstract dex(): DEX
  abstract token0(): Token
  abstract token1(): Token
  abstract feePercentage(): number

  abstract getQuoteAmountOut(amountIn: TokenAmount): Promise<TokenAmount>
  abstract fetchPoolPrice(): Promise<Price>
  abstract setOnPriceChange(callback: (price: Price) => void): Promise<void>

  toString(): string { // like printPoolData
    return `Pool (${this.dex().toUpperCase()}) ${this.id().substring(0, 4)}...${this.id().substring(this.id().length - 4, this.id().length)}: ${this.token0().symbol}/${this.token1().symbol} ${this.feePercentage()}% has price ${this.price() !== undefined ? readablePrice(this.price()).toFixed(6) : "undefined"}`;
  }
}

export type Token = {
  id: Address
  symbol: string
  decimals: number
}

export class TokenAmount {
  token: Token
  amount: BigInt

  constructor(token: Token, amount: BigInt) {
    this.token = token;
    this.amount = amount;
  }

  toString() {
    return parseFloat(this.amount.toString()) / 10 ** this.token.decimals + " " + this.token.symbol;
  }
}

export type Price = {
  token: Token
  quote: Token
  rawPrice: number
}

export const readablePrice = (price: Price) => {
  return price.rawPrice / 10 ** (price.quote.decimals - price.token.decimals);
}