# Cap Intel API

A Fastify-based API for token cap table intelligence using Moralis as the sole data provider.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your credentials:
```env
# Moralis API Key (get from https://admin.moralis.io/)
MORALIS_API_KEY=your_moralis_api_key_here

# Upstash Redis credentials (get from https://upstash.com/)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Server Configuration
PORT=3001
NODE_ENV=development
```

3. Build and run:
```bash
npm run build
npm start
```

Or run in development mode:
```bash
npm run dev
```

## API Endpoints

### GET /health
Returns service health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /v1/tokens/:address/holders
Returns token holders for a given token address on Base chain.

**Parameters:**
- `address` - Token contract address (0x...)

**Response:**
```json
[
  {
    "address": "0x1234...",
    "balance_formatted": "1000000.50",
    "percentage_relative_to_total_supply": 25.5,
    "is_contract": false,
    "entity_label": "Binance"
  }
]
```

### GET /v1/tokens/:address/pools
Returns liquidity pools for a token (currently returns empty array as Moralis SDK doesn't support this endpoint).

**Response:**
```json
[]
```

### GET /v1/tokens/:address/concentration
Returns concentration metrics for top 5 holders.

**Response:**
```json
{
  "raw_concentration": 75.5,
  "adjusted_concentration": 45.2,
  "raw_holders": [...],
  "adjusted_holders": [...]
}
```

## Features

- **Moralis Integration**: Uses Moralis EVM API for token data
- **Redis Caching**: 5-minute TTL caching with Upstash Redis
- **Request Logging**: Logs method, path, and response time
- **Error Handling**: Proper error responses with 500 status codes
- **Input Validation**: Validates Ethereum addresses

## Project Structure

```
src/
├── index.ts           # Main entry point
├── routes/
│   ├── health.ts      # Health check endpoint
│   └── tokens.ts      # Token-related endpoints
├── services/
│   ├── moralis.ts     # Moralis SDK initialization
│   └── redis.ts       # Redis client and caching logic
└── types/
    └── index.ts       # TypeScript type definitions
```

## Notes

- The pools endpoint returns an empty array because Moralis SDK doesn't provide a direct `getTokenPairs` method
- All token endpoints are cached for 5 minutes to reduce API calls
- Base chain ID is hardcoded to `0x2105`
