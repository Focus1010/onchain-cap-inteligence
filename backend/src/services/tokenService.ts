import { ethers } from 'ethers';
import { rpcConnection } from '../lib/rpc';
import { TokenMetadata } from '../types';

// ERC20 ABI (minimal for metadata functions)
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

export class TokenService {
  private provider = rpcConnection.getProvider();

  public async getTokenMetadata(address: string): Promise<TokenMetadata> {
    try {
      // Validate address format
      if (!await rpcConnection.validateAddress(address)) {
        throw new Error('Invalid Ethereum address format');
      }

      // Check if it's a contract
      if (!await rpcConnection.isContract(address)) {
        throw new Error('Address is not a contract');
      }

      const contract = new ethers.Contract(address, ERC20_ABI, this.provider);

      // Fetch all metadata in parallel
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      // Format total supply with decimals
      const formattedTotalSupply = ethers.formatUnits(totalSupply, decimals);

      return {
        name: name || 'Unknown Token',
        symbol: symbol || 'UNKNOWN',
        totalSupply: formattedTotalSupply,
        decimals: Number(decimals),
        address: address.toLowerCase()
      };

    } catch (error: any) {
      // Handle specific ethers errors
      if (error.code === 'CALL_EXCEPTION') {
        throw new Error('Contract does not implement ERC20 interface');
      }
      
      if (error.code === 'SERVER_ERROR') {
        throw new Error('RPC server error. Please try again later');
      }

      if (error.code === 'TIMEOUT') {
        throw new Error('Request timeout. Please try again later');
      }

      // Re-throw custom errors
      if (error.message.includes('Invalid Ethereum address') ||
          error.message.includes('not a contract') ||
          error.message.includes('does not implement ERC20')) {
        throw error;
      }

      // Generic error handling
      console.error('Error fetching token metadata:', error);
      throw new Error(`Failed to fetch token metadata: ${error.message || 'Unknown error'}`);
    }
  }

  public async validateTokenContract(address: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      await this.getTokenMetadata(address);
      return { isValid: true };
    } catch (error: any) {
      return { 
        isValid: false, 
        error: error.message || 'Unknown validation error' 
      };
    }
  }

  public async formatBalance(balance: string, decimals: number): Promise<string> {
    try {
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      throw new Error(`Failed to format balance: ${error}`);
    }
  }

  public async parseBalance(balance: string, decimals: number): Promise<string> {
    try {
      return ethers.parseUnits(balance, decimals).toString();
    } catch (error) {
      throw new Error(`Failed to parse balance: ${error}`);
    }
  }
}

export const tokenService = new TokenService();
