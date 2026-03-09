"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpcConnection = exports.RPCConnection = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class RPCConnection {
    constructor() {
        const rpcUrl = process.env.BASE_RPC_URL;
        const apiKey = process.env.ALCHEMY_API_KEY;
        if (!rpcUrl) {
            throw new Error('BASE_RPC_URL environment variable is not set');
        }
        let fullUrl = rpcUrl;
        console.log(`🔗 Connecting to Base RPC: ${fullUrl.replace(/\/[^\/]+$/, '/***')}`);
        this.provider = new ethers_1.ethers.JsonRpcProvider(fullUrl, {
            chainId: 8453,
            name: 'base'
        });
    }
    static getInstance() {
        if (!RPCConnection.instance) {
            RPCConnection.instance = new RPCConnection();
        }
        return RPCConnection.instance;
    }
    getProvider() {
        return this.provider;
    }
    async validateAddress(address) {
        try {
            return ethers_1.ethers.isAddress(address);
        }
        catch (error) {
            return false;
        }
    }
    async getContractCode(address) {
        try {
            const code = await this.provider.getCode(address);
            return code;
        }
        catch (error) {
            throw new Error(`Failed to get contract code for address ${address}: ${error}`);
        }
    }
    async isContract(address) {
        try {
            const code = await this.getContractCode(address);
            return code !== '0x';
        }
        catch (error) {
            return false;
        }
    }
    async getBlockNumber() {
        try {
            return await this.provider.getBlockNumber();
        }
        catch (error) {
            throw new Error(`Failed to get block number: ${error}`);
        }
    }
    async testConnection() {
        try {
            console.log('🔄 Testing RPC connection...');
            const blockNumber = await Promise.race([
                this.provider.getBlockNumber(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('RPC timeout')), 5000))
            ]);
            if (blockNumber > 0) {
                console.log(`✅ RPC connection successful (block: ${blockNumber})`);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('❌ RPC connection test failed:', error.message);
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                console.error('   🔑 Invalid or missing Alchemy API key');
                console.error('   💡 Get a free API key: https://dashboard.alchemy.com/');
            }
            else if (error.message.includes('timeout')) {
                console.error('   ⏱️  RPC request timed out');
                console.error('   💡 Try again or use a different RPC endpoint');
            }
            else {
                console.error('   🔧 Network or configuration issue');
            }
            return false;
        }
    }
}
exports.RPCConnection = RPCConnection;
exports.rpcConnection = RPCConnection.getInstance();
//# sourceMappingURL=rpc.js.map