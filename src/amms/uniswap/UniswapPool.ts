import { Address, PublicClient, decodeAbiParameters, getContract } from "viem";
import { Price, Token, TokenAmount } from "../utils";
import { univ3PoolAbi } from "../../abi/univ3pool-abi";
import { DEX } from "../Amm";
import { Pool } from "../Pool";

const Quoter = require('@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json');
const QUOTER_ADDRESS: Address = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";

export class UniswapPool extends Pool {
    private _id: Address;
    private _sqrtPriceX96: bigint | undefined;
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
        this._contract = getContract({ address: id, abi: univ3PoolAbi, publicClient: client });

        this._quoter = getContract({ address: QUOTER_ADDRESS, abi: Quoter.abi, publicClient: this._client });
    }

    // Getters
    public id() { return this._id };
    public dex() { return this._dex };
    public token0() { return this._token0 };
    public token1() { return this._token1 };
    public feePercentage() { return this._feePercentage };

    public price() {
        return this._sqrtPriceX96 !== undefined ?
            sqrtPriceToPrice(this._sqrtPriceX96, this._token0, this._token1) :
            { token: this._token0, quote: this._token1, rawPrice: NaN };
    };

    public setPrice(rawPrice: bigint): void {
        this._sqrtPriceX96 = rawPrice;
    }

    public async getQuoteAmountOut(amountIn: TokenAmount): Promise<TokenAmount> {
        const tokenIn = amountIn.token;
        const tokenOut = amountIn.token.id == this.token0().id ? this.token1() : this.token0();
        const result = await this._quoter.simulate.quoteExactInputSingle([{ tokenIn: tokenIn.id, tokenOut: tokenOut.id, fee: this.feePercentage() * 10000, amountIn: amountIn.amount, sqrtPriceLimitX96: 0 }]);
        const amountOut: any = result.result[0];
        return new TokenAmount(tokenOut, amountOut);
    }

    public async updatePoolPrice(): Promise<Price> {
        let result = await this._contract.read.slot0() as any;
        this._sqrtPriceX96 = result[0];
        return this.price();
    }

    public fetchPriceFunctionConfig() {
        return {
            address: this._id,
            abi: univ3PoolAbi,
            functionName: 'slot0',
        }
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

const sqrtPriceToPrice = (sqrtPriceX96: bigint, token0: Token, token1: Token) => {
    let sqrtPrice = parseFloat(sqrtPriceX96.toString()) / parseFloat((BigInt(2) ** BigInt(96)).toString());
    return { token: token0, quote: token1, rawPrice: sqrtPrice ** 2 };
}