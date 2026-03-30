"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenPools = getTokenPools;
const axios_1 = __importDefault(require("axios"));
const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest/dex/tokens';
async function getTokenPools(address) {
    try {
        const url = `${DEXSCREENER_BASE_URL}/${address}`;
        console.log(`📡 Fetching pools from DexScreener: ${url}`);
        const response = await axios_1.default.get(url, {
            timeout: 10000,
        });
        if (!response.data || !response.data.pairs || !Array.isArray(response.data.pairs)) {
            console.log('⚠️ No pairs found in DexScreener response');
            return [];
        }
        // Filter to Base chain only and map to our Pool interface
        const pools = response.data.pairs
            .filter((pair) => pair.chainId === 'base')
            .map((pair) => ({
            pair_address: pair.pairAddress?.toLowerCase() || '',
            dex_name: pair.dexId || 'Unknown',
            base_token_symbol: pair.baseToken?.symbol || '',
            quote_token_symbol: pair.quoteToken?.symbol || '',
            liquidity_usd: pair.liquidity?.usd || 0,
            volume_24h: pair.volume?.h24 || 0,
            price_usd: parseFloat(pair.priceUsd) || 0,
            price_change_24h: pair.priceChange?.h24 || 0,
            created_at: pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : null,
        }));
        console.log(`✅ DexScreener returned ${pools.length} pools for Base chain`);
        return pools;
    }
    catch (error) {
        console.error('❌ DexScreener API failed:', error.message || 'Unknown error');
        return [];
    }
}
//# sourceMappingURL=dexscreener.service.js.map