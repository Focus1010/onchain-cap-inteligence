import { Router, Request, Response } from 'express';
import { rpcConnection } from '../lib/rpc';
import { tokenService } from '../services/tokenService';
import { holderService } from '../services/holderService';
import { TokenResponse, ApiResponse, ErrorResponse } from '../types';

const router = Router();

// Validation middleware
const validateAddress = (req: Request, res: Response, next: Function): void => {
  const { address } = req.params;
  
  if (!address) {
    const error: ErrorResponse = {
      success: false,
      error: 'MISSING_ADDRESS',
      message: 'Contract address is required'
    };
    res.status(400).json(error);
    return;
  }

  // Basic Ethereum address format validation
  if (!/^0x[a-fA-F0-9]{40}$/.test(address as string)) {
    const error: ErrorResponse = {
      success: false,
      error: 'INVALID_ADDRESS',
      message: 'Invalid Ethereum address format'
    };
    res.status(400).json(error);
    return;
  }

  next();
};

// GET /api/token/:address
router.get('/:address', validateAddress, async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { address } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;

  try {
    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 100) {
      const error: ErrorResponse = {
        success: false,
        error: 'INVALID_LIMIT',
        message: 'Limit must be between 1 and 100'
      };
      res.status(400).json(error);
      return;
    }

    console.log(`Processing token request for address: ${address as string}`);

    // Fetch token metadata and holders in parallel
    const [tokenMetadata, holders] = await Promise.all([
      tokenService.getTokenMetadata(address as string),
      holderService.getTopHolders(address as string, limit)
    ]);

    // Add percentages to holders
    const holdersWithPercentage = holderService.formatHoldersWithPercentage(
      holders, 
      tokenMetadata.totalSupply
    );

    const response: TokenResponse = {
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      totalSupply: tokenMetadata.totalSupply,
      holders: holdersWithPercentage
    };

    const apiResponse: ApiResponse<TokenResponse> = {
      success: true,
      data: response,
      message: `Successfully fetched token data for ${tokenMetadata.symbol}`
    };

    const duration = Date.now() - startTime;
    console.log(`Token request completed in ${duration}ms`);

    res.json(apiResponse);

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`Token request failed after ${duration}ms:`, error.message);

    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An unexpected error occurred';

    // Map specific errors to appropriate responses
    if (error.message.includes('Invalid Ethereum address format')) {
      statusCode = 400;
      errorCode = 'INVALID_ADDRESS';
      errorMessage = 'Invalid Ethereum address format';
    } else if (error.message.includes('not a contract')) {
      statusCode = 400;
      errorCode = 'NOT_CONTRACT';
      errorMessage = 'Provided address is not a smart contract';
    } else if (error.message.includes('does not implement ERC20')) {
      statusCode = 400;
      errorCode = 'NOT_ERC20';
      errorMessage = 'Contract does not implement ERC20 interface';
    } else if (error.message.includes('RPC server error')) {
      statusCode = 503;
      errorCode = 'RPC_ERROR';
      errorMessage = 'RPC server is temporarily unavailable';
    } else if (error.message.includes('Request timeout')) {
      statusCode = 408;
      errorCode = 'TIMEOUT';
      errorMessage = 'Request timeout. Please try again later';
    } else if (error.message.includes('Invalid Alchemy API key')) {
      statusCode = 500;
      errorCode = 'API_KEY_ERROR';
      errorMessage = 'Service configuration error';
    } else if (error.message.includes('Rate limit exceeded')) {
      statusCode = 429;
      errorCode = 'RATE_LIMIT';
      errorMessage = 'Too many requests. Please try again later';
    } else if (error.message.includes('Network error')) {
      statusCode = 503;
      errorCode = 'NETWORK_ERROR';
      errorMessage = 'Network connectivity issues';
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: errorCode,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };

    res.status(statusCode).json(errorResponse);
  }
});

// GET /api/token/:address/metadata
router.get('/:address/metadata', validateAddress, async (req: Request, res: Response): Promise<void> => {
  const { address } = req.params;

  try {
    console.log(`Fetching metadata for address: ${address as string}`);
    
    const metadata = await tokenService.getTokenMetadata(address as string);

    const response: ApiResponse<typeof metadata> = {
      success: true,
      data: metadata,
      message: 'Successfully fetched token metadata'
    };

    res.json(response);

  } catch (error: any) {
    console.error('Metadata request failed:', error.message);

    let statusCode = 500;
    let errorMessage = 'Failed to fetch token metadata';

    if (error.message.includes('Invalid Ethereum address format')) {
      statusCode = 400;
      errorMessage = 'Invalid Ethereum address format';
    } else if (error.message.includes('not a contract')) {
      statusCode = 400;
      errorMessage = 'Provided address is not a smart contract';
    } else if (error.message.includes('does not implement ERC20')) {
      statusCode = 400;
      errorMessage = 'Contract does not implement ERC20 interface';
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'METADATA_ERROR',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };

    res.status(statusCode).json(errorResponse);
  }
});

// GET /api/token/:address/holders
router.get('/:address/holders', validateAddress, async (req: Request, res: Response): Promise<void> => {
  const { address } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;

  try {
    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 100) {
      const error: ErrorResponse = {
        success: false,
        error: 'INVALID_LIMIT',
        message: 'Limit must be between 1 and 100'
      };
      res.status(400).json(error);
      return;
    }

    console.log(`Fetching holders for address: ${address as string}, limit: ${limit}`);
    
    const holders = await holderService.getTopHolders(address as string, limit);

    const response: ApiResponse<typeof holders> = {
      success: true,
      data: holders,
      message: `Successfully fetched ${holders.length} token holders`
    };

    res.json(response);

  } catch (error: any) {
    console.error('Holders request failed:', error.message);

    let statusCode = 500;
    let errorMessage = 'Failed to fetch token holders';

    if (error.message.includes('Invalid Alchemy API key')) {
      statusCode = 500;
      errorMessage = 'Service configuration error';
    } else if (error.message.includes('Rate limit exceeded')) {
      statusCode = 429;
      errorMessage = 'Too many requests. Please try again later';
    } else if (error.message.includes('Network error')) {
      statusCode = 503;
      errorMessage = 'Network connectivity issues';
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'HOLDERS_ERROR',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };

    res.status(statusCode).json(errorResponse);
  }
});

export default router;
