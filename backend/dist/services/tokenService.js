"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const ethers_1 = require("ethers");
const rpc_1 = require("../lib/rpc");
const ERC20_ABI = [
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];
class TokenService {
    constructor() {
        this.provider = rpc_1.rpcConnection.getProvider();
    }
    async getTokenMetadata(address) {
        try {
            if (!await rpc_1.rpcConnection.validateAddress(address)) {
                throw new Error('Invalid Ethereum address format');
            }
            if (!await rpc_1.rpcConnection.isContract(address)) {
                throw new Error('Address is not a contract');
            }
            const contract = new ethers_1.ethers.Contract(address, ERC20_ABI, this.provider);
            const [name, symbol, decimals, totalSupply] = await Promise.all([
                contract.name(),
                contract.symbol(),
                contract.decimals(),
                contract.totalSupply()
            ]);
            const formattedTotalSupply = ethers_1.ethers.formatUnits(totalSupply, decimals);
            return {
                name: name || 'Unknown Token',
                symbol: symbol || 'UNKNOWN',
                totalSupply: formattedTotalSupply,
                decimals: Number(decimals),
                address: address.toLowerCase()
            };
        }
        catch (error) {
            if (error.code === 'CALL_EXCEPTION') {
                throw new Error('Contract does not implement ERC20 interface');
            }
            if (error.code === 'SERVER_ERROR') {
                throw new Error('RPC server error. Please try again later');
            }
            if (error.code === 'TIMEOUT') {
                throw new Error('Request timeout. Please try again later');
            }
            if (error.message.includes('Invalid Ethereum address') ||
                error.message.includes('not a contract') ||
                error.message.includes('does not implement ERC20')) {
                throw error;
            }
            console.error('Error fetching token metadata:', error);
            throw new Error(`Failed to fetch token metadata: ${error.message || 'Unknown error'}`);
        }
    }
    async validateTokenContract(address) {
        try {
            await this.getTokenMetadata(address);
            return { isValid: true };
        }
        catch (error) {
            return {
                isValid: false,
                error: error.message || 'Unknown validation error'
            };
        }
    }
    async formatBalance(balance, decimals) {
        try {
            return ethers_1.ethers.formatUnits(balance, decimals);
        }
        catch (error) {
            throw new Error(`Failed to format balance: ${error}`);
        }
    }
    async parseBalance(balance, decimals) {
        try {
            return ethers_1.ethers.parseUnits(balance, decimals).toString();
        }
        catch (error) {
            throw new Error(`Failed to parse balance: ${error}`);
        }
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
//# sourceMappingURL=tokenService.js.map