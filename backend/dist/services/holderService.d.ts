import { TokenHolder } from '../types';
export declare class HolderService {
    private readonly ALCHEMY_API_KEY;
    private readonly BASE_URL;
    constructor();
    getTopHolders(contractAddress: string, limit?: number): Promise<TokenHolder[]>;
    getHolderCount(contractAddress: string): Promise<number>;
    validateHolderData(holders: TokenHolder[]): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    formatHoldersWithPercentage(holders: TokenHolder[], totalSupply: string): TokenHolder[];
}
export declare const holderService: HolderService;
//# sourceMappingURL=holderService.d.ts.map