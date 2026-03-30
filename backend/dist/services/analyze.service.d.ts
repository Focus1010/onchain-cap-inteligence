import { ClassificationType } from './classification.service';
export interface TokenAnalysis {
    token: {
        name: string;
        symbol: string;
        total_supply_formatted: string;
        logo: string | null;
        verified_contract: boolean;
    };
    holders: {
        total_holders: number;
        top_holders: Array<{
            address: string;
            balance_formatted: string;
            percentage_relative_to_total_supply: number;
            is_contract: boolean;
            entity_label: string | null;
            classification: ClassificationType;
        }>;
    };
    concentration: {
        raw_top5: number;
        adjusted_top5: number;
        individual_holders: number;
        eoa_only_top5: Array<{
            address: string;
            balance_formatted: string;
            percentage_relative_to_total_supply: number;
            is_contract: boolean;
            entity_label: string | null;
            classification: ClassificationType;
        }>;
    };
    pools: {
        total_pools: number;
        total_liquidity_usd: number;
        total_volume_24h: number;
        pools: Array<{
            pair_address: string;
            dex_name: string;
            base_token_symbol: string;
            quote_token_symbol: string;
            liquidity_usd: number;
            volume_24h: number;
            price_usd: number;
            price_change_24h: number;
            created_at: string;
        }>;
    };
    classification_summary: {
        eoa_count: number;
        smart_wallet_count: number;
        lp_count: number;
        staking_count: number;
        multisig_count: number;
        burn_count: number;
        unknown_contract_count: number;
    };
    analyzed_at: string;
}
export declare function getTokenAnalysis(address: string): Promise<TokenAnalysis>;
//# sourceMappingURL=analyze.service.d.ts.map