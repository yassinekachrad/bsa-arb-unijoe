import { AMM, DEX, Pool, Price, Token, TokenAmount } from '../utils';
import axios from 'axios';
import { Address, GetContractParameters, PublicClient, decodeAbiParameters, getContract } from 'viem';
import { LBPairV21ABI } from './lbpair-abi';

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
        this._contract = getContract({address: id, abi: LBPairV21ABI, publicClient: client});
    }

    // Getters
    public id() {return this._id};
    public dex() {return this._dex};
    public price() {
        if (this._activeBin !== undefined) 
            return {token: this._token0, quote: this._token1, rawPrice: (1 + this._binStep / 10_000) ** (this._activeBin - 8388608)};
        else
            return {token: this._token0, quote: this._token1, rawPrice: NaN};
    };
    public token0() {return this._token0};
    public token1() {return this._token1};
    public feePercentage() {return this._feePercentage};

    // Functions
    public priceFromBin(bin: number): Price {
        return {token: this._token0, quote: this._token1, rawPrice: (1 + this._binStep / 10_000) ** (bin - 8388608)};
    }

    public async setOnPriceChange(callback: (price: Price) => void): Promise<void> {
        let current = this;
        this._contract.watchEvent.Swap(
            {},
            {
            onLogs(logs: any) {
                const eventData = decodeAbiParameters(
                    [
                        { name: 'id', type: 'uint24'},
                        { name: 'amountsIn', type: 'bytes32'},
                        { name: 'amountsOut', type: 'bytes32'},
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

    public async fetchPoolPrice(): Promise<Price> {
        this._activeBin = await this._contract.read.getActiveId();
        return this.price();
    }

    public async getQuoteAmountOut(amountIn: TokenAmount): Promise<TokenAmount> {
        let tokenIn = amountIn.token.id;
        let tokenOut = amountIn.token.id == this._token0.id ? this._token1 : this._token0;
        let res = await this._contract.read.getSwapOut([BigInt(amountIn.amount.toString()), tokenIn == this._token0.id ? true : false]);
        let amountOut = res[1];
        return new TokenAmount(tokenOut, amountOut);
    }
}

export class TraderJoe implements AMM {
    private _client: PublicClient;

    constructor(client: PublicClient) {
        this._client = client;
    }

    public async getPools(minUSDPoolTVL: number): Promise<Pool[]> {
        const pools: Pool[] = [];
        let pageNum = 1;
        let pageSize = 25;
        let result: any;
        do {
            result = await axios.get(`https://barn.traderjoexyz.com/v1/pools/arbitrum?filterBy=1d&orderBy=liquidity&pageNum=${pageNum}&pageSize=${pageSize}&status=unverified`);
            for (const poolData of result.data) {
                if (poolData.liquidityUsd > minUSDPoolTVL) {
                    let token0 = {id: poolData.tokenX.address, symbol: poolData.tokenX.symbol, decimals: poolData.tokenX.decimals};
                    let token1 = {id: poolData.tokenY.address, symbol: poolData.tokenY.symbol, decimals: poolData.tokenY.decimals};
                    let pool = new LBPair(poolData.pairAddress, DEX.TRADERJOE, token0, token1, poolData.lbBaseFeePct, poolData.lbBinStep, this._client);
                    pools.push(pool);
                }
            }
            pageNum += 1;
        } while (result.data.length > 0);
        return pools;
    }
}