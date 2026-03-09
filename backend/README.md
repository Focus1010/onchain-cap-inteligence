# CHR Backend API

Onchain Cap Table Intelligence Backend Service

## Overview

This backend service provides REST API endpoints for analyzing ERC20 tokens on Base mainnet. It fetches token metadata and holder distribution data using blockchain RPC connections and Alchemy's indexer API.

## Features

- ✅ **Base Mainnet RPC Connection** - Reliable blockchain connectivity
- ✅ **ERC20 Token Metadata** - Name, symbol, total supply, decimals
- ✅ **Top Holder Fetching** - Using Alchemy API for indexed data
- ✅ **Clean API Architecture** - Production-ready structure
- ✅ **Comprehensive Error Handling** - Graceful error responses
- ✅ **TypeScript Support** - Full type safety
- ✅ **CORS Enabled** - Frontend integration ready

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Ethers.js** - Blockchain interaction
- **Axios** - HTTP client for Alchemy API
- **dotenv** - Environment variable management

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── lib/
│   │   └── rpc.ts          # RPC connection service
│   ├── services/
│   │   ├── tokenService.ts   # ERC20 metadata service
│   │   └── holderService.ts  # Holder data service
│   ├── routes/
│   │   └── token.ts         # API routes
│   └── types/
│       └── index.ts         # TypeScript types
├── dist/                   # Compiled JavaScript
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure environment variables in `.env`:
   ```env
   # Base Mainnet RPC URL
   BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/
   
   # Alchemy API Key
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

### Running the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### API Info
- `GET /api` - API documentation and endpoints

### Token Analysis
- `GET /api/token/:address` - Complete token data (metadata + holders)
- `GET /api/token/:address/metadata` - Token metadata only
- `GET /api/token/:address/holders?limit=50` - Token holders only

### Request Examples

```bash
# Get complete token data
curl "http://localhost:3001/api/token/0x4200000000000000000000000000000000000000006"

# Get token metadata only
curl "http://localhost:3001/api/token/0x4200000000000000000000000000000000000000006/metadata"

# Get top 20 holders
curl "http://localhost:3001/api/token/0x4200000000000000000000000000000000000000006/holders?limit=20"
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "name": "Example Token",
    "symbol": "EXT",
    "totalSupply": "1000000000.000000000000000000",
    "holders": [
      {
        "address": "0x1234...5678",
        "balance": "100000000.000000000000000000",
        "percentage": 10.0
      }
    ]
  },
  "message": "Successfully fetched token data for EXT"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "INVALID_ADDRESS",
  "message": "Invalid Ethereum address format",
  "details": "..."
}
```

## Error Handling

The API includes comprehensive error handling for:

- **Invalid Addresses** - Malformed Ethereum addresses
- **Contract Validation** - Non-contract addresses or non-ERC20 contracts
- **RPC Failures** - Network connectivity issues
- **API Rate Limits** - Alchemy API throttling
- **Timeouts** - Request timeouts
- **Server Errors** - Internal server issues

## Environment Variables

| Variable | Required | Description |
|----------|-----------|-------------|
| `BASE_RPC_URL` | Yes | Base mainnet RPC endpoint |
| `ALCHEMY_API_KEY` | Yes | Alchemy API key for holder data |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (development/production) |

## CORS Configuration

**Development:** Allows `localhost:3000` and `localhost:5173`
**Production:** Configure your frontend domain in the server code

## Logging

The server provides comprehensive logging:
- Request timestamps and methods
- Response times
- Error details (in development)
- RPC connection status

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Use environment-specific RPC URLs
4. Implement proper monitoring
5. Set up reverse proxy (nginx)
6. Configure SSL certificates

## Rate Limiting

Current implementation relies on Alchemy's rate limits. Consider implementing:
- Redis-based rate limiting
- Request caching
- Queue system for high traffic

## Security Considerations

- Environment variables for sensitive data
- Input validation and sanitization
- Error message sanitization in production
- CORS configuration
- Request size limits

## Next Steps

- [ ] Add database caching layer
- [ ] Implement holder classification logic
- [ ] Add more blockchain networks
- [ ] Implement API rate limiting
- [ ] Add comprehensive testing suite
- [ ] Add API documentation (Swagger)
- [ ] Implement monitoring and alerting

## License

MIT License - see LICENSE file for details
