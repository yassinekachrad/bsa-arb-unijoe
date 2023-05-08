import { Abi } from "abitype";
import { Address, ContractFunctionConfig, PublicClient } from "viem"
import { Pool } from "./Pool";



export type Token = {
  id: Address
  symbol: string
  decimals: number
}

export class TokenAmount {
  token: Token
  amount: bigint

  constructor(token: Token, amount: bigint) {
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