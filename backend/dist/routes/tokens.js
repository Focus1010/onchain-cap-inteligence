"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRoutes = tokenRoutes;
const moralis_1 = require("../services/moralis");
const redis_1 = require("../services/redis");
const dexscreener_service_1 = require("../services/dexscreener.service");
// Validate Ethereum address
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}
// GET /v1/tokens/:address/holders
async function getHolders(request, reply) {
    const { address } = request.params;
    if (!isValidAddress(address)) {
        reply.code(400).send({
            error: 'Invalid address',
            details: 'Address must be a valid Ethereum address (0x + 40 hex characters)',
        });
        return;
    }
    try {
        // Check cache first
        const cacheKey = (0, redis_1.generateCacheKey)('holders', address);
        const cached = await (0, redis_1.getCache)(cacheKey);
        if (cached) {
            reply.send(cached);
            return;
        }
        // Initialize Moralis if needed
        await (0, moralis_1.initMoralis)();
        const Moralis = (0, moralis_1.getMoralis)();
        // Call Moralis getTokenOwners
        const response = await Moralis.EvmApi.token.getTokenOwners({
            chain: moralis_1.BASE_CHAIN_ID,
            tokenAddress: address,
            limit: 100,
        });
        const holders = response.result.map((owner) => ({
            address: owner.ownerAddress,
            balance_formatted: owner.balanceFormatted,
            percentage_relative_to_total_supply: owner.percentageRelativeToTotalSupply,
            is_contract: owner.isContract,
            entity_label: owner.entityLabel || null,
        }));
        // Cache the result
        await (0, redis_1.setCache)(cacheKey, holders);
        reply.send(holders);
    }
    catch (error) {
        console.error('Error fetching holders:', error);
        reply.code(500).send({
            error: 'Failed to fetch data',
            details: error.message || 'Unknown error occurred',
        });
    }
}
// GET /v1/tokens/:address/pools
async function getPools(request, reply) {
    const { address } = request.params;
    if (!isValidAddress(address)) {
        reply.code(400).send({
            error: 'Invalid address',
            details: 'Address must be a valid Ethereum address (0x + 40 hex characters)',
        });
        return;
    }
    try {
        // Check cache first
        const cacheKey = (0, redis_1.generateCacheKey)('pools', address);
        const cached = await (0, redis_1.getCache)(cacheKey);
        if (cached) {
            reply.send(cached);
            return;
        }
        // Initialize Moralis if needed
        await (0, moralis_1.initMoralis)();
        const Moralis = (0, moralis_1.getMoralis)();
        const pools = await (0, dexscreener_service_1.getTokenPools)(address);
        // Cache with 3 minute TTL (liquidity changes faster)
        await (0, redis_1.setCache)(cacheKey, pools, 180);
        reply.send(pools);
    }
    catch (error) {
        console.error('Error fetching pools:', error);
        reply.code(500).send({
            error: 'Failed to fetch data',
            details: error.message || 'Unknown error occurred',
        });
    }
}
// GET /v1/tokens/:address/concentration
async function getConcentration(request, reply) {
    const { address } = request.params;
    if (!isValidAddress(address)) {
        reply.code(400).send({
            error: 'Invalid address',
            details: 'Address must be a valid Ethereum address (0x + 40 hex characters)',
        });
        return;
    }
    try {
        // Check cache first
        const cacheKey = (0, redis_1.generateCacheKey)('concentration', address);
        const cached = await (0, redis_1.getCache)(cacheKey);
        if (cached) {
            reply.send(cached);
            return;
        }
        // Initialize Moralis if needed
        await (0, moralis_1.initMoralis)();
        const Moralis = (0, moralis_1.getMoralis)();
        // Call holders endpoint internally
        const holdersResponse = await Moralis.EvmApi.token.getTokenOwners({
            chain: moralis_1.BASE_CHAIN_ID,
            tokenAddress: address,
            limit: 100,
        });
        const holders = holdersResponse.result.map((owner) => ({
            address: owner.ownerAddress,
            balance_formatted: owner.balanceFormatted,
            percentage_relative_to_total_supply: owner.percentageRelativeToTotalSupply,
            is_contract: owner.isContract,
            entity_label: owner.entityLabel || null,
        }));
        // Get top 5 holders by percentage
        const topHolders = holders
            .sort((a, b) => b.percentage_relative_to_total_supply - a.percentage_relative_to_total_supply)
            .slice(0, 5);
        // Calculate raw concentration (sum of top 5 percentages)
        const raw_concentration = topHolders.reduce((sum, h) => sum + h.percentage_relative_to_total_supply, 0);
        // Calculate adjusted concentration (exclude contracts)
        const adjustedHolders = topHolders.filter((h) => !h.is_contract);
        const adjusted_concentration = adjustedHolders.reduce((sum, h) => sum + h.percentage_relative_to_total_supply, 0);
        const metrics = {
            raw_concentration,
            adjusted_concentration,
            raw_holders: topHolders,
            adjusted_holders: adjustedHolders,
        };
        // Cache the result
        await (0, redis_1.setCache)(cacheKey, metrics);
        reply.send(metrics);
    }
    catch (error) {
        console.error('Error calculating concentration:', error);
        reply.code(500).send({
            error: 'Failed to fetch data',
            details: error.message || 'Unknown error occurred',
        });
    }
}
// GET /v1/tokens/:address/metadata
async function getMetadata(request, reply) {
    const { address } = request.params;
    if (!isValidAddress(address)) {
        reply.code(400).send({
            error: 'Invalid address',
            details: 'Address must be a valid Ethereum address (0x + 40 hex characters)',
        });
        return;
    }
    try {
        // Check cache first
        const cacheKey = (0, redis_1.generateCacheKey)('metadata', address);
        const cached = await (0, redis_1.getCache)(cacheKey);
        if (cached) {
            reply.send(cached);
            return;
        }
        // Initialize Moralis if needed
        await (0, moralis_1.initMoralis)();
        const Moralis = (0, moralis_1.getMoralis)();
        // Call Moralis getTokenMetadata
        const response = await Moralis.EvmApi.token.getTokenMetadata({
            chain: moralis_1.BASE_CHAIN_ID,
            addresses: [address],
        });
        // Log response structure for debugging
        console.log('Moralis metadata response:', JSON.stringify(response, null, 2));
        const tokenData = response.result[0].token;
        const metadata = {
            name: tokenData.name || 'Unknown',
            symbol: tokenData.symbol || 'UNKNOWN',
            decimals: tokenData.decimals || 18,
            total_supply: tokenData.totalSupply || tokenData.total_supply || '0',
            total_supply_formatted: tokenData.totalSupplyFormatted || tokenData.total_supply_formatted || '0',
            contract_type: tokenData.contractType || tokenData.contract_type || 'ERC20',
            verified_contract: tokenData.verifiedContract || tokenData.verified || false,
            logo: tokenData.logo || null,
            created_at: tokenData.createdAt || tokenData.created_at || null,
        };
        // Cache with 30 minute TTL (metadata changes rarely)
        await (0, redis_1.setCache)(cacheKey, metadata, 1800);
        reply.send(metadata);
    }
    catch (error) {
        console.error('Error fetching metadata:', error);
        reply.code(500).send({
            error: 'Failed to fetch data',
            details: error.message || 'Unknown error occurred',
        });
    }
}
async function tokenRoutes(fastify) {
    fastify.get('/v1/tokens/:address/holders', getHolders);
    fastify.get('/v1/tokens/:address/pools', getPools);
    fastify.get('/v1/tokens/:address/concentration', getConcentration);
    fastify.get('/v1/tokens/:address/metadata', getMetadata);
}
//# sourceMappingURL=tokens.js.map