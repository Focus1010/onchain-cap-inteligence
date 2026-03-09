import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

export class RPCConnection {
  private provider: ethers.JsonRpcProvider;
  private static instance: RPCConnection;

  private constructor() {
    const rpcUrl = process.env.BASE_RPC_URL;
    const apiKey = process.env.ALCHEMY_API_KEY;
    
    if (!rpcUrl) {
      throw new Error('BASE_RPC_URL environment variable is not set');
    }

    // Use the RPC URL directly for now
    let fullUrl = rpcUrl;
    
    console.log(`🔗 Connecting to Base RPC: ${fullUrl.replace(/\/[^\/]+$/, '/***')}`); // Hide API key in logs

    // Create provider with explicit network configuration for Base
    this.provider = new ethers.JsonRpcProvider(fullUrl, {
      chainId: 8453, // Base mainnet chain ID
      name: 'base'
    });
  }

  public static getInstance(): RPCConnection {
    if (!RPCConnection.instance) {
      RPCConnection.instance = new RPCConnection();
    }
    return RPCConnection.instance;
  }

  public getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  public async validateAddress(address: string): Promise<boolean> {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  public async getContractCode(address: string): Promise<string> {
    try {
      const code = await this.provider.getCode(address);
      return code;
    } catch (error) {
      throw new Error(`Failed to get contract code for address ${address}: ${error}`);
    }
  }

  public async isContract(address: string): Promise<boolean> {
    try {
      const code = await this.getContractCode(address);
      return code !== '0x';
    } catch (error) {
      return false;
    }
  }

  public async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      throw new Error(`Failed to get block number: ${error}`);
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 Testing RPC connection...');
      
      // Try to get block number with timeout
      const blockNumber = await Promise.race([
        this.provider.getBlockNumber(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('RPC timeout')), 5000))
      ]) as number;
      
      if (blockNumber > 0) {
        console.log(`✅ RPC connection successful (block: ${blockNumber})`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ RPC connection test failed:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('   🔑 Invalid or missing Alchemy API key');
        console.error('   💡 Get a free API key: https://dashboard.alchemy.com/');
      } else if (error.message.includes('timeout')) {
        console.error('   ⏱️  RPC request timed out');
        console.error('   💡 Try again or use a different RPC endpoint');
      } else {
        console.error('   🔧 Network or configuration issue');
      }
      
      return false;
    }
  }
}

export const rpcConnection = RPCConnection.getInstance();
