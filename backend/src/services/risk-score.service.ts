import { getTokenAnalysis, TokenAnalysis } from './analyze.service';

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

// 1. Adjusted Concentration Risk (40 points max)
function calculateConcentrationScore(adjustedTop5: number): number {
  // 0–10% → 0 points
  // 11–20% → 10 points
  // 21–35% → 20 points
  // 36–50% → 30 points
  // 51%+ → 40 points
  if (adjustedTop5 <= 10) return 0;
  if (adjustedTop5 <= 20) return 10;
  if (adjustedTop5 <= 35) return 20;
  if (adjustedTop5 <= 50) return 30;
  return 40;
}

// 2. Unknown Contract Risk (25 points max) - Ratio-based
function calculateUnknownContractScore(unknownContractRatio: number): number {
  // 0–5% unknown contracts → 0 points
  // 6–15% → 8 points
  // 16–25% → 15 points
  // 26–40% → 20 points
  // 41%+ → 25 points
  if (unknownContractRatio <= 5) return 0;
  if (unknownContractRatio <= 15) return 8;
  if (unknownContractRatio <= 25) return 15;
  if (unknownContractRatio <= 40) return 20;
  return 25;
}

// 3. Liquidity Risk (20 points max)
function calculateLiquidityScore(totalLiquidityUsd: number): number {
  // $500k+ → 0 points
  // $100k–$499k → 5 points
  // $50k–$99k → 10 points
  // $10k–$49k → 15 points
  // Under $10k or no pools → 20 points
  if (totalLiquidityUsd >= 500000) return 0;
  if (totalLiquidityUsd >= 100000) return 5;
  if (totalLiquidityUsd >= 50000) return 10;
  if (totalLiquidityUsd >= 10000) return 15;
  return 20;
}

// 4. Contract Verification Risk (10 points max)
function calculateVerificationScore(verified: boolean): number {
  // true → 0 points
  // false → 10 points
  return verified ? 0 : 10;
}

// 5. Pool Count Risk (5 points max)
function calculatePoolCountScore(totalPools: number): number {
  // 3+ pools → 0 points
  // 2 pools → 2 points
  // 1 pool → 3 points
  // 0 pools → 5 points
  if (totalPools >= 3) return 0;
  if (totalPools === 2) return 2;
  if (totalPools === 1) return 3;
  return 5;
}

// Calculate holder diversity bonus (negative = reduces risk score)
function calculateDiversityBonus(
  totalPools: number,
  totalHolders: number,
  adjustedTop5: number,
  totalLiquidityUsd: number
): number {
  let bonus = 0;

  // Base bonus: pools >= 5 AND holders >= 50 AND adjusted_top5 < 20%
  if (totalPools >= 5 && totalHolders >= 50 && adjustedTop5 < 20) {
    bonus -= 5;
  }

  // Additional bonus: same conditions + liquidity >= $100k
  if (totalPools >= 5 && totalHolders >= 50 && adjustedTop5 < 20 && totalLiquidityUsd >= 100000) {
    bonus -= 5;
  }

  return bonus;
}

function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  // 0–25 → "LOW"
  // 26–50 → "MEDIUM"
  // 51–74 → "HIGH"
  // 75–100 → "CRITICAL"
  if (score <= 25) return 'LOW';
  if (score <= 50) return 'MEDIUM';
  if (score <= 74) return 'HIGH';
  return 'CRITICAL';
}

export async function calculateRiskScore(address: string): Promise<RiskScoreResult> {
  // Get full token analysis
  const analysis = await getTokenAnalysis(address);

  const totalHolders = analysis.holders.total_holders;
  const unknownContractCount = analysis.classification_summary.unknown_contract_count;

  // Calculate unknown contract ratio
  const unknownContractRatio = totalHolders > 0
    ? (unknownContractCount / totalHolders) * 100
    : 0;

  // Calculate individual scores
  const concentrationScore = calculateConcentrationScore(analysis.concentration.adjusted_top5);
  const unknownContractScore = calculateUnknownContractScore(unknownContractRatio);
  const liquidityScore = calculateLiquidityScore(analysis.pools.total_liquidity_usd);
  const verificationScore = calculateVerificationScore(analysis.token.verified_contract);
  const poolCountScore = calculatePoolCountScore(analysis.pools.total_pools);

  // Calculate diversity bonus (negative = reduces risk)
  const diversityBonus = calculateDiversityBonus(
    analysis.pools.total_pools,
    totalHolders,
    analysis.concentration.adjusted_top5,
    analysis.pools.total_liquidity_usd
  );

  // Calculate total risk score
  let totalScore =
    concentrationScore +
    unknownContractScore +
    liquidityScore +
    verificationScore +
    poolCountScore +
    diversityBonus;

  // Ensure score doesn't go below 0
  totalScore = Math.max(0, totalScore);

  return {
    address,
    symbol: analysis.token.symbol,
    risk_score: totalScore,
    risk_level: getRiskLevel(totalScore),
    breakdown: {
      concentration_score: concentrationScore,
      unknown_contract_score: unknownContractScore,
      unknown_contract_ratio: parseFloat(unknownContractRatio.toFixed(2)),
      liquidity_score: liquidityScore,
      verification_score: verificationScore,
      pool_count_score: poolCountScore,
      holder_diversity_bonus: diversityBonus,
    },
    summary: {
      adjusted_top5: analysis.concentration.adjusted_top5,
      unknown_contracts: unknownContractCount,
      total_holders: totalHolders,
      total_liquidity_usd: analysis.pools.total_liquidity_usd,
      total_pools: analysis.pools.total_pools,
      verified: analysis.token.verified_contract,
    },
    analyzed_at: analysis.analyzed_at,
  };
}
