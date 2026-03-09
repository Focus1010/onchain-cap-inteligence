import { TokenResponse, ApiResponse, ErrorResponse } from '@/types/api';

const API_BASE_URL = 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export { ApiError };
export class TokenApiService {
  private static readonly BASE_URL = API_BASE_URL;
  private static readonly TIMEOUT = 30000; // 30 seconds

  /**
   * Validates Ethereum address format
   */
  private static validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Shortens address for display (0x1234...abcd)
   */
  private static shortenAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Formats balance with commas and proper decimal places
   */
  private static formatBalance(balance: string): string {
    try {
      // Remove any existing formatting and parse as number
      const num = parseFloat(balance);
      if (isNaN(num)) return balance;
      
      // Format with commas and up to 6 decimal places
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
      });
    } catch {
      return balance;
    }
  }

  /**
   * Fetches token data from the backend API
   */
  static async fetchToken(address: string): Promise<TokenResponse> {
    // Validate address format
    if (!this.validateAddress(address)) {
      throw new ApiError(
        'Invalid Ethereum address format. Must start with 0x and be 42 characters long.',
        400,
        'INVALID_ADDRESS'
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      const response = await fetch(`${this.BASE_URL}/api/token/${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json().catch(() => ({
          success: false,
          error: 'UNKNOWN_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`
        }));

        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.error
        );
      }

      const apiResponse: ApiResponse<TokenResponse> = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        throw new ApiError(
          apiResponse.error || 'Failed to fetch token data',
          500,
          apiResponse.error || 'API_ERROR'
        );
      }

      return apiResponse.data;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          'Request timeout. Please try again.',
          408,
          'TIMEOUT'
        );
      }

      if (error instanceof Error && error.message.includes('fetch')) {
        throw new ApiError(
          'Network error. Unable to connect to the server.',
          0,
          'NETWORK_ERROR'
        );
      }

      // Re-throw unknown errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Utility method to format holder data for display
   */
  static formatHolders(holders: TokenResponse['holders']) {
    return holders.slice(0, 10).map((holder, index) => ({
      rank: index + 1,
      address: holder.address,
      shortAddress: this.shortenAddress(holder.address),
      balance: this.formatBalance(holder.balance),
      percentage: holder.percentage
    }));
  }

  /**
   * Utility method to format total supply
   */
  static formatTotalSupply(totalSupply: string): string {
    return this.formatBalance(totalSupply);
  }
}

export default TokenApiService;
