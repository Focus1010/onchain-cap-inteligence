"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRoutes = analyzeRoutes;
const moralis_1 = require("../services/moralis");
const redis_1 = require("../services/redis");
const classification_service_1 = require("../services/classification.service");
// Validate Ethereum address
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}
// POST /v1/analyze
async function analyzeToken(request, reply) {
    const { address, chain } = request.body;
    // Validate address
    if (!address) {
        reply.code(400).send({
            error: 'Token address is required',
            details: 'Please provide a token address in the request body',
        });
        return;
    }
    if (!isValidAddress(address)) {
        reply.code(400).send({
            error: 'Invalid address',
            details: 'Address must be a valid Ethereum address (0x + 40 hex characters)',
        });
        return;
    }
    try {
        // Check cache first
        const cacheKey = (0, redis_1.generateCacheKey)('analyze', address);
        const cached = await (0, redis_1.getCache)(cacheKey);
        if (cached) {
            reply.send(cached);
            return;
        }
        // Initialize Moralis if needed
        await (0, moralis_1.initMoralis)();
        const Moralis = (0, moralis_1.getMoralis)();
        // Fetch metadata
        const metadataResponse = await Moralis.EvmApi.token.getTokenMetadata({
            chain: moralis_1.BASE_CHAIN_ID,
            addresses: [address],
        });
        const tokenData = metadataResponse.result[0]?.token || {};
        // Fetch holders
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
        // Fetch pools (empty for now - Moralis doesn't have direct getTokenPairs)
        const pools = [];
        // Get all pool addresses for LP detection
        const poolAddresses = pools.map((p) => p.pair_address?.toLowerCase());
        // Classify all holders with new detailed classification
        const classifiedHolders = holders.map((holder) => ({
            ...holder,
            classification: (0, classification_service_1.classifyAddress)(holder, poolAddresses),
        }));
        // Classification summary with all 7 types
        const classificationSummary = {
            eoa_count: 0,
            smart_wallet_count: 0,
            lp_count: 0,
            staking_count: 0,
            multisig_count: 0,
            burn_count: 0,
            unknown_contract_count: 0,
        };
        classifiedHolders.forEach((holder) => {
            const classification = holder.classification;
            switch (classification) {
                case 'eoa':
                    classificationSummary.eoa_count++;
                    break;
                case 'smart_wallet':
                    classificationSummary.smart_wallet_count++;
                    break;
                case 'lp':
                    classificationSummary.lp_count++;
                    break;
                case 'staking':
                    classificationSummary.staking_count++;
                    break;
                case 'multisig':
                    classificationSummary.multisig_count++;
                    break;
                case 'burn':
                    classificationSummary.burn_count++;
                    break;
                case 'contract':
                    classificationSummary.unknown_contract_count++;
                    break;
            }
        });
        // Get top 5 holders by percentage (from classified holders)
        const topHolders = classifiedHolders
            .sort((a, b) => b.percentage_relative_to_total_supply - a.percentage_relative_to_total_supply)
            .slice(0, 5);
        // Calculate concentration metrics
        const raw_top5 = topHolders.reduce((sum, h) => sum + h.percentage_relative_to_total_supply, 0);
        // Adjusted concentration includes EOAs and smart wallets (individual control)
        const adjustedHolders = topHolders.filter((h) => h.classification === 'eoa' || h.classification === 'smart_wallet');
        const adjusted_top5 = adjustedHolders.reduce((sum, h) => sum + h.percentage_relative_to_total_supply, 0);
        // Individual holders count = EOAs + smart wallets
        const individual_holders = classificationSummary.eoa_count + classificationSummary.smart_wallet_count;
        // Build the response
        const analysis = {
            token: {
                name: tokenData.name || 'Unknown',
                symbol: tokenData.symbol || 'UNKNOWN',
                total_supply_formatted: tokenData.totalSupplyFormatted || tokenData.total_supply_formatted || '0',
                logo: tokenData.logo || null,
                verified_contract: tokenData.verified || tokenData.verified_contract || false,
            },
            holders: {
                total_holders: holders.length,
                top_holders: topHolders.map((h) => ({
                    address: h.address,
                    balance_formatted: h.balance_formatted,
                    percentage_relative_to_total_supply: h.percentage_relative_to_total_supply,
                    is_contract: h.is_contract,
                    entity_label: h.entity_label,
                    classification: h.classification,
                })),
            },
            concentration: {
                raw_top5: raw_top5,
                adjusted_top5: adjusted_top5,
                individual_holders: individual_holders,
                eoa_only_top5: adjustedHolders.map((h) => ({
                    address: h.address,
                    balance_formatted: h.balance_formatted,
                    percentage_relative_to_total_supply: h.percentage_relative_to_total_supply,
                    is_contract: h.is_contract,
                    entity_label: h.entity_label,
                    classification: h.classification,
                })),
            },
            pools: {
                total_pools: pools.length,
                total_liquidity_usd: pools.reduce((sum, p) => sum + (p.liquidity_usd || 0), 0),
                pools: pools,
            },
            classification_summary: classificationSummary,
            analyzed_at: new Date().toISOString(),
        };
        // Cache the full analysis with 10 minute TTL
        await (0, redis_1.setCache)(cacheKey, analysis, 600);
        reply.send(analysis);
    }
    catch (error) {
        console.error('Error analyzing token:', error);
        reply.code(500).send({
            error: 'Analysis failed',
            details: error.message || 'Unknown error occurred',
        });
    }
}
async function analyzeRoutes(fastify) {
    fastify.post('/v1/analyze', analyzeToken);
}
//# sourceMappingURL=analyze.js.map