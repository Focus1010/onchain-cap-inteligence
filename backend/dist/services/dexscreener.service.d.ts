export interface Pool {
    pair_address: string;
    dex_name: string;
    base_token_symbol: string;
    quote_token_symbol: string;
    liquidity_usd: number;
    volume_24h: number;
    price_usd: number;
    price_change_24h: number;
    created_at: string | null;
}
export declare function getTokenPools(address: string): Promise<Pool[]>;
//# sourceMappingURL=dexscreener.service.d.ts.map