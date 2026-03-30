export interface TokenHolder {
  address: string;
  balance_formatted: string;
  percentage_relative_to_total_supply: number;
  is_contract: boolean;
  entity_label: string | null;
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
