export interface RiskScoreResult {
    address: string;
    symbol: string;
    risk_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    breakdown: {
        concentration_score: number;
        unknown_contract_score: number;
        unknown_contract_ratio: number;
        liquidity_score: number;
        verification_score: number;
        pool_count_score: number;
        holder_diversity_bonus: number;
    };
    summary: {
        adjusted_top5: number;
        unknown_contracts: number;
        total_holders: number;
        total_liquidity_usd: number;
        total_pools: number;
        verified: boolean;
    };
    analyzed_at: string;
}
export declare function calculateRiskScore(address: string): Promise<RiskScoreResult>;
//# sourceMappingURL=risk-score.service.d.ts.map