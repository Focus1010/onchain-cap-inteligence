export interface TokenHolder {
  address: string;
  balance: string;
  percentage?: number;
}

export interface TokenResponse {
  name: string;
  symbol: string;
  totalSupply: string;
  holders: TokenHolder[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
