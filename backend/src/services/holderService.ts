import axios, { AxiosResponse } from 'axios';
import { TokenHolder, AlchemyHolderResponse } from '../types';

export class HolderService {
  private readonly ALCHEMY_API_KEY: string;
  private readonly BASE_URL = 'https://base-mainnet.g.alchemy.com/v2';

  constructor() {
    this.ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || '';
    
    // Only throw error if trying to use holder-specific methods without API key
    if (!this.ALCHEMY_API_KEY) {
      console.warn('⚠️  ALCHEMY_API_KEY not set - holder data will be unavailable');
      console.warn('   💡 Get a free API key: https://dashboard.alchemy.com/');
    }
  }

  public async getTopHolders(contractAddress: string, limit: number = 50): Promise<TokenHolder[]> {
    if (!this.ALCHEMY_API_KEY) {
      throw new Error('Holder data requires ALCHEMY_API_KEY. Set it in .env file to enable holder analysis.');
    }

    try {
      const url = `${this.BASE_URL}/${this.ALCHEMY_API_KEY}`;
      
      const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenBalances',
        params: [
          contractAddress,
          {
            pageSize: limit,
            pageKey: null
          }
        ]
      };

      const response: AxiosResponse<AlchemyHolderResponse> = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      if (!response.data || !response.data.holders) {
        throw new Error('Invalid response from Alchemy API');
      }

      // Transform the data to our TokenHolder interface
      const holders: TokenHolder[] = response.data.holders
        .filter(holder => holder && holder.address && holder.balance !== '0')
        .map(holder => ({
          address: holder.address.toLowerCase(),
          balance: holder.balance
        }));

      return holders;

    } catch (error: any) {
      console.error('Error fetching holders from Alchemy:', error);

      // Handle specific axios errors
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again later');
      }

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          throw new Error('Bad request: Invalid contract address or parameters');
        }

        if (status === 401) {
          throw new Error('Invalid Alchemy API key');
        }

        if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later');
        }

        if (status === 500) {
          throw new Error('Alchemy API server error. Please try again later');
        }

        // Handle specific Alchemy error messages
        if (data?.error?.message) {
          throw new Error(`Alchemy API error: ${data.error.message}`);
        }
      }

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error. Unable to connect to Alchemy API');
      }

      throw new Error(`Failed to fetch token holders: ${error.message || 'Unknown error'}`);
    }
  }

  public async getHolderCount(contractAddress: string): Promise<number> {
    try {
      const holders = await this.getTopHolders(contractAddress, 1000); // Get max possible to count
      return holders.length;
    } catch (error) {
      console.error('Error getting holder count:', error);
      return 0;
    }
  }

  public async validateHolderData(holders: TokenHolder[]): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!Array.isArray(holders)) {
      errors.push('Holders data must be an array');
      return { isValid: false, errors };
    }

    for (let i = 0; i < holders.length; i++) {
      const holder = holders[i];
      
      if (!holder.address || typeof holder.address !== 'string') {
        errors.push(`Holder ${i}: Invalid or missing address`);
      }

      if (!holder.balance || typeof holder.balance !== 'string') {
        errors.push(`Holder ${i}: Invalid or missing balance`);
      }

      if (holder.address && !/^0x[a-fA-F0-9]{40}$/.test(holder.address)) {
        errors.push(`Holder ${i}: Invalid address format`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public formatHoldersWithPercentage(holders: TokenHolder[], totalSupply: string): TokenHolder[] {
    try {
      const totalSupplyBN = BigInt(totalSupply);
      
      if (totalSupplyBN === 0n) {
        return holders.map(holder => ({
          ...holder,
          percentage: 0
        }));
      }

      return holders.map(holder => {
        const balanceBN = BigInt(holder.balance);
        const percentage = Number((balanceBN * 10000n) / totalSupplyBN) / 100; // 2 decimal places
        
        return {
          ...holder,
          percentage: Math.max(0, Math.min(100, percentage)) // Clamp between 0-100
        };
      });
    } catch (error) {
      console.error('Error calculating percentages:', error);
      return holders; // Return original holders if calculation fails
    }
  }
}

export const holderService = new HolderService();
