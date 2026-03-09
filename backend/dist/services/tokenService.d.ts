import { TokenMetadata } from '../types';
export declare class TokenService {
    private provider;
    getTokenMetadata(address: string): Promise<TokenMetadata>;
    validateTokenContract(address: string): Promise<{
        isValid: boolean;
        error?: string;
    }>;
    formatBalance(balance: string, decimals: number): Promise<string>;
    parseBalance(balance: string, decimals: number): Promise<string>;
}
export declare const tokenService: TokenService;
//# sourceMappingURL=tokenService.d.ts.map