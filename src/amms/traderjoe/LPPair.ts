import { Address, PublicClient, getContract, decodeAbiParameters } from "viem";
import { LBPairV21ABI } from "../../abi/lbpair-abi";
import { Price, TokenAmount, Token } from "../utils";
import { Pool } from "../Pool";
import { DEX } from "../Amm";

export class LBPair extends Pool {
    private _id: Address;
    private _activeBin: number | undefined;
    private _dex: DEX;
    private _token0: Token;
    private _token1: Token;
    private _feePercentage: number;
    private _binStep: number;

    private _client: PublicClient;
    private _contract;

    constructor(id: Address, dex: DEX, token0: Token, token1: Token, feePercentage: number, binStep: number, client: PublicClient) {
        super();
        this._id = id;
        this._activeBin = undefined;
        this._dex = dex;
        this._token0 = token0;
        this._token1 = token1;
        this._feePercentage = feePercentage;
        this._client = client;
        this._binStep = binStep;
        this._contract = getContract({ address: id, abi: LBPairV21ABI, publicClient: client });
    }

    // Getters
    public id() { return this._id };
    public dex() { return this._dex };
    public price() {
        if (this._activeBin !== undefined)
            return { token: this._token0, quote: this._token1, rawPrice: (1 + this._binStep / 10_000) ** (this._activeBin - 8388608) };
        else
            return { token: this._token0, quote: this._token1, rawPrice: NaN };
    };
    public setPrice(price: bigint): void {
        this._activeBin = parseInt(price.toString());
    }
    public token0() { return this._token0 };
    public token1() { return this._token1 };
    public feePercentage() { return this._feePercentage };

    // Functions
    public priceFromBin(bin: number): Price {
        return { token: this._token0, quote: this._token1, rawPrice: (1 + this._binStep / 10_000) ** (bin - 8388608) };
    }

    public async setOnPriceChange(callback: (price: Price) => void): Promise<void> {
        let current = this;
        this._contract.watchEvent.Swap(
            {},
            {
                onLogs(logs: any) {
                    const eventData = decodeAbiParameters(
                        [
                            { name: 'id', type: 'uint24' },
                            { name: 'amountsIn', type: 'bytes32' },
                            { name: 'amountsOut', type: 'bytes32' },
                            { name: 'volatilityAccumulator', type: 'uint24' },
                            { name: 'totalFees', type: 'bytes32' },
                            { name: 'protocolFees', type: 'bytes32' },
                        ],
                        logs[0].data);
                    current._activeBin = eventData[0];
                    callback(current.price());
                }
            });
    }

    public async updatePoolPrice(): Promise<Price> {
        this._activeBin = await this._contract.read.getActiveId();
        return this.price();
    }

    public fetchPriceFunctionConfig() {
        return {
            address: this._id,
            abi: LBPairV21ABI,
            functionName: 'getActiveId',
        }
    }

    public async getQuoteAmountOut(amountIn: TokenAmount): Promise<TokenAmount> {
        let tokenIn = amountIn.token.id;
        let tokenOut = amountIn.token.id == this._token0.id ? this._token1 : this._token0;
        let res = await this._contract.read.getSwapOut([BigInt(amountIn.amount.toString()), tokenIn == this._token0.id ? true : false]);
        let amountOut = res[1];
        return new TokenAmount(tokenOut, amountOut);
    }
}