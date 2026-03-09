export interface TokenMetadata {
    name: string;
    symbol: string;
    totalSupply: string;
    decimals: number;
    address: string;
}
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
export interface HealthResponse {
    status: string;
    timestamp: string;
    uptime: number;
}
export interface AlchemyHolderResponse {
    holders: Array<{
        address: string;
        balance: string;
    }>;
    pageKey?: string;
}
export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
    details?: any;
}
export type HolderType = 'EOA' | 'LP' | 'Smart Wallet' | 'DAO' | 'Staking' | 'Burn';
//# sourceMappingURL=index.d.ts.map