export type ClassificationType = 'eoa' | 'lp' | 'burn' | 'staking' | 'multisig' | 'smart_wallet' | 'contract';
interface HolderObject {
    address: string;
    is_contract: boolean;
    entity_label: string | null;
}
export declare function classifyAddress(holder: HolderObject, poolAddresses: string[]): ClassificationType;
export {};
//# sourceMappingURL=classification.service.d.ts.map