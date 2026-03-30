/// <reference types="vite/client" />
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
      classification: 'eoa' | 'smart_wallet' | 'lp' | 'staking' | 'multisig' | 'burn' | 'contract';
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
      classification: 'eoa' | 'smart_wallet' | 'lp' | 'staking' | 'multisig' | 'burn' | 'contract';
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

export async function analyzeToken(address: string): Promise<TokenAnalysis | null> {
  try {
    const response = await fetch(`${BASE_URL}/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, chain: 'base' }),
    });
    if (!response.ok) throw new Error('Failed to analyze token');
    return await response.json();
  } catch (error) {
    console.error('Error analyzing token:', error);
    return null;
  }
}

export async function getTokenHolders(address: string): Promise<TokenAnalysis['holders'] | null> {
  try {
    const response = await fetch(`${BASE_URL}/v1/tokens/${address}/holders`);
    if (!response.ok) throw new Error('Failed to get token holders');
    return await response.json();
  } catch (error) {
    console.error('Error getting token holders:', error);
    return null;
  }
}

export async function getTokenRiskScore(address: string): Promise<RiskScoreResult | null> {
  try {
    const response = await fetch(`${BASE_URL}/v1/tokens/${address}/risk-score`);
    if (!response.ok) throw new Error('Failed to get risk score');
    return await response.json();
  } catch (error) {
    console.error('Error getting risk score:', error);
    return null;
  }
}

export async function getTokenConcentration(address: string): Promise<TokenAnalysis['concentration'] | null> {
  try {
    const response = await fetch(`${BASE_URL}/v1/tokens/${address}/concentration`);
    if (!response.ok) throw new Error('Failed to get concentration');
    return await response.json();
  } catch (error) {
    console.error('Error getting concentration:', error);
    return null;
  }
}

export async function getTokenPools(address: string): Promise<TokenAnalysis['pools'] | null> {
  try {
    const response = await fetch(`${BASE_URL}/v1/tokens/${address}/pools`);
    if (!response.ok) throw new Error('Failed to get pools');
    return await response.json();
  } catch (error) {
    console.error('Error getting pools:', error);
    return null;
  }
}
