"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRoutes = tokenRoutes;
const moralis_1 = require("../services/moralis");
const redis_1 = require("../services/redis");
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
        // Note: Moralis doesn't have a direct getTokenPairs endpoint
        // Returning empty array with note for now
        const pools = [];
        console.log('Pools endpoint: Moralis SDK does not have getTokenPairs method');
        // Cache the result
        await (0, redis_1.setCache)(cacheKey, pools);
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
async function tokenRoutes(fastify) {
    fastify.get('/v1/tokens/:address/holders', getHolders);
    fastify.get('/v1/tokens/:address/pools', getPools);
    fastify.get('/v1/tokens/:address/concentration', getConcentration);
}
//# sourceMappingURL=tokens.js.map