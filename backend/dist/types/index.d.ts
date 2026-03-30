export interface TokenHolder {
    address: string;
    balance_formatted: string;
    percentage_relative_to_total_supply: number;
    is_contract: boolean;
    entity_label: string | null;
}
export interface TokenMetadata {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
    total_supply_formatted: string;
    contract_type: string;
    verified_contract: boolean;
    logo: string | null;
    created_at: string | null;
}
export interface Pool {
    pair_address: string;
    exchange_name: string;
    pair_label: string;
    liquidity_usd: number;
}
export interface ConcentrationMetrics {
    raw_concentration: number;
    adjusted_concentration: number;
    raw_holders: TokenHolder[];
    adjusted_holders: TokenHolder[];
}
export interface HealthResponse {
    status: string;
    timestamp: string;
}
export interface ErrorResponse {
    error: string;
    details: string;
}
//# sourceMappingURL=index.d.ts.map