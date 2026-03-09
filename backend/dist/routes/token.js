"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tokenService_1 = require("../services/tokenService");
const holderService_1 = require("../services/holderService");
const router = (0, express_1.Router)();
const validateAddress = (req, res, next) => {
    const { address } = req.params;
    if (!address) {
        const error = {
            success: false,
            error: 'MISSING_ADDRESS',
            message: 'Contract address is required'
        };
        res.status(400).json(error);
        return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        const error = {
            success: false,
            error: 'INVALID_ADDRESS',
            message: 'Invalid Ethereum address format'
        };
        res.status(400).json(error);
        return;
    }
    next();
};
router.get('/:address', validateAddress, async (req, res) => {
    const startTime = Date.now();
    const { address } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    try {
        if (isNaN(limit) || limit < 1 || limit > 100) {
            const error = {
                success: false,
                error: 'INVALID_LIMIT',
                message: 'Limit must be between 1 and 100'
            };
            res.status(400).json(error);
            return;
        }
        console.log(`Processing token request for address: ${address}`);
        const [tokenMetadata, holders] = await Promise.all([
            tokenService_1.tokenService.getTokenMetadata(address),
            holderService_1.holderService.getTopHolders(address, limit)
        ]);
        const holdersWithPercentage = holderService_1.holderService.formatHoldersWithPercentage(holders, tokenMetadata.totalSupply);
        const response = {
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            totalSupply: tokenMetadata.totalSupply,
            holders: holdersWithPercentage
        };
        const apiResponse = {
            success: true,
            data: response,
            message: `Successfully fetched token data for ${tokenMetadata.symbol}`
        };
        const duration = Date.now() - startTime;
        console.log(`Token request completed in ${duration}ms`);
        res.json(apiResponse);
    }
    catch (error) {
        const duration = Date.now() - startTime;
        console.error(`Token request failed after ${duration}ms:`, error.message);
        let statusCode = 500;
        let errorCode = 'INTERNAL_ERROR';
        let errorMessage = 'An unexpected error occurred';
        if (error.message.includes('Invalid Ethereum address format')) {
            statusCode = 400;
            errorCode = 'INVALID_ADDRESS';
            errorMessage = 'Invalid Ethereum address format';
        }
        else if (error.message.includes('not a contract')) {
            statusCode = 400;
            errorCode = 'NOT_CONTRACT';
            errorMessage = 'Provided address is not a smart contract';
        }
        else if (error.message.includes('does not implement ERC20')) {
            statusCode = 400;
            errorCode = 'NOT_ERC20';
            errorMessage = 'Contract does not implement ERC20 interface';
        }
        else if (error.message.includes('RPC server error')) {
            statusCode = 503;
            errorCode = 'RPC_ERROR';
            errorMessage = 'RPC server is temporarily unavailable';
        }
        else if (error.message.includes('Request timeout')) {
            statusCode = 408;
            errorCode = 'TIMEOUT';
            errorMessage = 'Request timeout. Please try again later';
        }
        else if (error.message.includes('Invalid Alchemy API key')) {
            statusCode = 500;
            errorCode = 'API_KEY_ERROR';
            errorMessage = 'Service configuration error';
        }
        else if (error.message.includes('Rate limit exceeded')) {
            statusCode = 429;
            errorCode = 'RATE_LIMIT';
            errorMessage = 'Too many requests. Please try again later';
        }
        else if (error.message.includes('Network error')) {
            statusCode = 503;
            errorCode = 'NETWORK_ERROR';
            errorMessage = 'Network connectivity issues';
        }
        const errorResponse = {
            success: false,
            error: errorCode,
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        res.status(statusCode).json(errorResponse);
    }
});
router.get('/:address/metadata', validateAddress, async (req, res) => {
    const { address } = req.params;
    try {
        console.log(`Fetching metadata for address: ${address}`);
        const metadata = await tokenService_1.tokenService.getTokenMetadata(address);
        const response = {
            success: true,
            data: metadata,
            message: 'Successfully fetched token metadata'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Metadata request failed:', error.message);
        let statusCode = 500;
        let errorMessage = 'Failed to fetch token metadata';
        if (error.message.includes('Invalid Ethereum address format')) {
            statusCode = 400;
            errorMessage = 'Invalid Ethereum address format';
        }
        else if (error.message.includes('not a contract')) {
            statusCode = 400;
            errorMessage = 'Provided address is not a smart contract';
        }
        else if (error.message.includes('does not implement ERC20')) {
            statusCode = 400;
            errorMessage = 'Contract does not implement ERC20 interface';
        }
        const errorResponse = {
            success: false,
            error: 'METADATA_ERROR',
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        res.status(statusCode).json(errorResponse);
    }
});
router.get('/:address/holders', validateAddress, async (req, res) => {
    const { address } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    try {
        if (isNaN(limit) || limit < 1 || limit > 100) {
            const error = {
                success: false,
                error: 'INVALID_LIMIT',
                message: 'Limit must be between 1 and 100'
            };
            res.status(400).json(error);
            return;
        }
        console.log(`Fetching holders for address: ${address}, limit: ${limit}`);
        const holders = await holderService_1.holderService.getTopHolders(address, limit);
        const response = {
            success: true,
            data: holders,
            message: `Successfully fetched ${holders.length} token holders`
        };
        res.json(response);
    }
    catch (error) {
        console.error('Holders request failed:', error.message);
        let statusCode = 500;
        let errorMessage = 'Failed to fetch token holders';
        if (error.message.includes('Invalid Alchemy API key')) {
            statusCode = 500;
            errorMessage = 'Service configuration error';
        }
        else if (error.message.includes('Rate limit exceeded')) {
            statusCode = 429;
            errorMessage = 'Too many requests. Please try again later';
        }
        else if (error.message.includes('Network error')) {
            statusCode = 503;
            errorMessage = 'Network connectivity issues';
        }
        const errorResponse = {
            success: false,
            error: 'HOLDERS_ERROR',
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        res.status(statusCode).json(errorResponse);
    }
});
exports.default = router;
//# sourceMappingURL=token.js.map