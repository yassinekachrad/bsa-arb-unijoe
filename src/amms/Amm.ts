import { Pool } from "./Pool";

export enum DEX {
    UNISWAP = "Uniswap",
    TRADERJOE = "TraderJoe"
}

export abstract class AMM<T extends Pool> {
    abstract getPools(minUSDPoolTVL: number): Promise<Pool[]>;
    abstract fetchAllPoolPrices(pools: T[]): Promise<void>;

    public async getPoolAndLoadPrices(minUSDPoolTVL: number): Promise<Pool[]> {
        const pools = await this.getPools(minUSDPoolTVL);
        await this.fetchAllPoolPrices(pools as T[]);
        return pools;
    }
}