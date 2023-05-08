import { Address } from "viem";
import { Price, TokenAmount, readablePrice, Token } from "./utils";
import { DEX } from "./Amm";

export abstract class Pool {
    abstract id(): Address
    abstract price(): Price // user readable price
    abstract setPrice(price: bigint): void
    abstract dex(): DEX
    abstract token0(): Token
    abstract token1(): Token
    abstract feePercentage(): number
  
    abstract getQuoteAmountOut(amountIn: TokenAmount): Promise<TokenAmount>
    abstract updatePoolPrice(): Promise<Price>
    abstract setOnPriceChange(callback: (price: Price) => void): Promise<void>
  
    abstract fetchPriceFunctionConfig(): any
  
    toString(): string { // like printPoolData
      return `Pool (${this.dex().toUpperCase()}) ${this.id().substring(0, 4)}...${this.id().substring(this.id().length - 4, this.id().length)}: ${this.token0().symbol}/${this.token1().symbol} ${this.feePercentage()}%`; //has price ${this.price() !== undefined ? readablePrice(this.price()).toFixed(6) : "undefined"}`;
    }
  }