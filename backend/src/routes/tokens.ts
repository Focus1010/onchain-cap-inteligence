import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getMoralis, BASE_CHAIN_ID, initMoralis } from '../services/moralis';
import { getCache, setCache, generateCacheKey } from '../services/redis';
import { TokenHolder, Pool, ConcentrationMetrics, ErrorResponse } from '../types';

// Validate Ethereum address
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// GET /v1/tokens/:address/holders
async function getHolders(
  request: FastifyRequest<{ Params: { address: string } }>,
  reply: FastifyReply
): Promise<void> {
  const { address } = request.params;

  if (!isValidAddress(address)) {
    reply.code(400).send({
      error: 'Invalid address',
      details: 'Address must be a valid Ethereum address (0x + 40 hex characters)',
    } as ErrorResponse);
    return;
  }

  try {
    // Check cache first
    const cacheKey = generateCacheKey('holders', address);
    const cached = await getCache<TokenHolder[]>(cacheKey);
    if (cached) {
      reply.send(cached);
      return;
    }

    // Initialize Moralis if needed
    await initMoralis();
    const Moralis = getMoralis();

    // Call Moralis getTokenOwners
    const response = await Moralis.EvmApi.token.getTokenOwners({
      chain: BASE_CHAIN_ID,
      tokenAddress: address,
      limit: 100,
    });

    const holders: TokenHolder[] = response.result.map((owner: any) => ({
      address: owner.ownerAddress,
      balance_formatted: owner.balanceFormatted,
      percentage_relative_to_total_supply: owner.percentageRelativeToTotalSupply,
      is_contract: owner.isContract,
      entity_label: owner.entityLabel || null,
    }));

    // Cache the result
    await setCache(cacheKey, holders);

    reply.send(holders);
  } catch (error: any) {
    console.error('Error fetching holders:', error);
    reply.code(500).send({
      error: 'Failed to fetch data',
      details: error.message || 'Unknown error occurred',
    } as ErrorResponse);
  }
}

// GET /v1/tokens/:address/pools
async function getPools(
  request: FastifyRequest<{ Params: { address: string } }>,
  reply: FastifyReply
): Promise<void> {
  const { address } = request.params;

  if (!isValidAddress(address)) {
    reply.code(400).send({
      error: 'Invalid address',
      details: 'Address must be a valid Ethereum address (0x + 40 hex characters)',
    } as ErrorResponse);
    return;
  }

  try {
    // Check cache first
    const cacheKey = generateCacheKey('pools', address);
    const cached = await getCache<Pool[]>(cacheKey);
    if (cached) {
      reply.send(cached);
      return;
    }

    // Initialize Moralis if needed
    await initMoralis();
    const Moralis = getMoralis();

    // Note: Moralis doesn't have a direct getTokenPairs endpoint
    // Returning empty array with note for now
    const pools: Pool[] = [];
    console.log('Pools endpoint: Moralis SDK does not have getTokenPairs method');

    // Cache the result
    await setCache(cacheKey, pools);

    reply.send(pools);
  } catch (error: any) {
    console.error('Error fetching pools:', error);
    reply.code(500).send({
      error: 'Failed to fetch data',
      details: error.message || 'Unknown error occurred',
    } as ErrorResponse);
  }
}

// GET /v1/tokens/:address/concentration
async function getConcentration(
  request: FastifyRequest<{ Params: { address: string } }>,
  reply: FastifyReply
): Promise<void> {
  const { address } = request.params;

  if (!isValidAddress(address)) {
    reply.code(400).send({
      error: 'Invalid address',
      details: 'Address must be a valid Ethereum address (0x + 40 hex characters)',
    } as ErrorResponse);
    return;
  }

  try {
    // Check cache first
    const cacheKey = generateCacheKey('concentration', address);
    const cached = await getCache<ConcentrationMetrics>(cacheKey);
    if (cached) {
      reply.send(cached);
      return;
    }

    // Initialize Moralis if needed
    await initMoralis();
    const Moralis = getMoralis();

    // Call holders endpoint internally
    const holdersResponse = await Moralis.EvmApi.token.getTokenOwners({
      chain: BASE_CHAIN_ID,
      tokenAddress: address,
      limit: 100,
    });

    const holders: TokenHolder[] = holdersResponse.result.map((owner: any) => ({
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

    const metrics: ConcentrationMetrics = {
      raw_concentration,
      adjusted_concentration,
      raw_holders: topHolders,
      adjusted_holders: adjustedHolders,
    };

    // Cache the result
    await setCache(cacheKey, metrics);

    reply.send(metrics);
  } catch (error: any) {
    console.error('Error calculating concentration:', error);
    reply.code(500).send({
      error: 'Failed to fetch data',
      details: error.message || 'Unknown error occurred',
    } as ErrorResponse);
  }
}

export async function tokenRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/v1/tokens/:address/holders', getHolders);
  fastify.get('/v1/tokens/:address/pools', getPools);
  fastify.get('/v1/tokens/:address/concentration', getConcentration);
}
