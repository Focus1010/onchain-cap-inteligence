import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { calculateRiskScore } from '../services/risk-score.service';
import { getCache, setCache, generateCacheKey } from '../services/redis';
import { ErrorResponse } from '../types';

// Validate Ethereum address
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// GET /v1/tokens/:address/risk-score
async function getRiskScore(
  request: FastifyRequest<{ Params: { address: string } }>,
  reply: FastifyReply
): Promise<void> {
  const { address } = request.params;

  // Validate address
  if (!address) {
    reply.code(400).send({
      error: 'Token address is required',
      details: 'Please provide a token address in the URL parameter',
    } as ErrorResponse);
    return;
  }

  if (!isValidAddress(address)) {
    reply.code(400).send({
      error: 'Invalid address',
      details: 'Address must be a valid Ethereum address (0x + 40 hex characters)',
    } as ErrorResponse);
    return;
  }

  try {
    // Check cache first
    const cacheKey = generateCacheKey('risk', address);
    const cached = await getCache(cacheKey);
    if (cached) {
      reply.send(cached);
      return;
    }

    // Calculate risk score
    const riskScore = await calculateRiskScore(address);

    // Cache the result with 10 minute TTL
    await setCache(cacheKey, riskScore, 600);

    reply.send(riskScore);
  } catch (error: any) {
    console.error('Error calculating risk score:', error);
    reply.code(500).send({
      error: 'Risk score calculation failed',
      details: error.message || 'Unknown error occurred',
    } as ErrorResponse);
  }
}

export async function riskScoreRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/v1/tokens/:address/risk-score', getRiskScore);
}
