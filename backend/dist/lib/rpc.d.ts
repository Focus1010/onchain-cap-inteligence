import { ethers } from 'ethers';
export declare class RPCConnection {
    private provider;
    private static instance;
    private constructor();
    static getInstance(): RPCConnection;
    getProvider(): ethers.JsonRpcProvider;
    validateAddress(address: string): Promise<boolean>;
    getContractCode(address: string): Promise<string>;
    isContract(address: string): Promise<boolean>;
    getBlockNumber(): Promise<number>;
    testConnection(): Promise<boolean>;
}
export declare const rpcConnection: RPCConnection;
//# sourceMappingURL=rpc.d.ts.map