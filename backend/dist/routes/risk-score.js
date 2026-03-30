"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskScoreRoutes = riskScoreRoutes;
const risk_score_service_1 = require("../services/risk-score.service");
const redis_1 = require("../services/redis");
// Validate Ethereum address
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}
// GET /v1/tokens/:address/risk-score
async function getRiskScore(request, reply) {
    const { address } = request.params;
    // Validate address
    if (!address) {
        reply.code(400).send({
            error: 'Token address is required',
            details: 'Please provide a token address in the URL parameter',
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
        const cacheKey = (0, redis_1.generateCacheKey)('risk', address);
        const cached = await (0, redis_1.getCache)(cacheKey);
        if (cached) {
            reply.send(cached);
            return;
        }
        // Calculate risk score
        const riskScore = await (0, risk_score_service_1.calculateRiskScore)(address);
        // Cache the result with 10 minute TTL
        await (0, redis_1.setCache)(cacheKey, riskScore, 600);
        reply.send(riskScore);
    }
    catch (error) {
        console.error('Error calculating risk score:', error);
        reply.code(500).send({
            error: 'Risk score calculation failed',
            details: error.message || 'Unknown error occurred',
        });
    }
}
async function riskScoreRoutes(fastify) {
    fastify.get('/v1/tokens/:address/risk-score', getRiskScore);
}
//# sourceMappingURL=risk-score.js.map