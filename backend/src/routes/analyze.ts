import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getMoralis, BASE_CHAIN_ID, initMoralis } from '../services/moralis';
import { getCache, setCache, generateCacheKey } from '../services/redis';
import { classifyAddress, ClassificationType } from '../services/classification.service';
import { getTokenPools, Pool } from '../services/dexscreener.service';
import { ErrorResponse } from '../types';

// Validate Ethereum address
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Analyze request body
interface AnalyzeRequest {
  address: string;
  chain: string;
}

// POST /v1/analyze
async function analyzeToken(
  request: FastifyRequest<{ Body: AnalyzeRequest }>,
  reply: FastifyReply
): Promise<void> {
  const { address, chain } = request.body;

  // Validate address
  if (!address) {
    reply.code(400).send({
      error: 'Token address is required',
      details: 'Please provide a token address in the request body',
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
    const cacheKey = generateCacheKey('analyze', address);
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      reply.send(cached);
      return;
    }

    // Initialize Moralis if needed
    await initMoralis();
    const Moralis = getMoralis();

    // Fetch metadata
    const metadataResponse = await Moralis.EvmApi.token.getTokenMetadata({
      chain: BASE_CHAIN_ID,
      addresses: [address],
    });

    const tokenData: any = metadataResponse.result[0]?.token || {};

    // Fetch holders
    const holdersResponse = await Moralis.EvmApi.token.getTokenOwners({
      chain: BASE_CHAIN_ID,
      tokenAddress: address,
      limit: 100,
    });

    const holders: any[] = holdersResponse.result.map((owner: any) => ({
      address: owner.ownerAddress,
      balance_formatted: owner.balanceFormatted,
      percentage_relative_to_total_supply: owner.percentageRelativeToTotalSupply,
      is_contract: owner.isContract,
      entity_label: owner.entityLabel || null,
    }));

    // Fetch pools from DexScreener
    const pools = await getTokenPools(address);

    // Get all pool addresses for LP detection (lowercase)
    const poolAddresses: string[] = pools.map((p: Pool) => p.pair_address.toLowerCase());

    // Classify all holders with new detailed classification
    const classifiedHolders = holders.map((holder: any) => ({
      ...holder,
      classification: classifyAddress(holder, poolAddresses),
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

    classifiedHolders.forEach((holder: any) => {
      const classification: ClassificationType = holder.classification;
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
      .sort((a: any, b: any) => b.percentage_relative_to_total_supply - a.percentage_relative_to_total_supply)
      .slice(0, 5);

    // Calculate concentration metrics
    const raw_top5 = topHolders.reduce((sum: number, h: any) => sum + h.percentage_relative_to_total_supply, 0);
    
    // Adjusted concentration excludes contracts, LPs, staking, multisig, burn - includes only EOAs and smart wallets (individual control)
    const adjustedHolders = topHolders.filter((h: any) => h.classification === 'eoa' || h.classification === 'smart_wallet');
    const adjusted_top5 = adjustedHolders.reduce((sum: number, h: any) => sum + h.percentage_relative_to_total_supply, 0);
    
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
        top_holders: topHolders.map((h: any) => ({
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
        eoa_only_top5: adjustedHolders.map((h: any) => ({
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
        total_liquidity_usd: pools.reduce((sum: number, p: Pool) => sum + (p.liquidity_usd || 0), 0),
        total_volume_24h: pools.reduce((sum: number, p: Pool) => sum + (p.volume_24h || 0), 0),
        pools: pools.map((p: Pool) => ({
          pair_address: p.pair_address,
          dex_name: p.dex_name,
          base_token_symbol: p.base_token_symbol,
          quote_token_symbol: p.quote_token_symbol,
          liquidity_usd: p.liquidity_usd,
          volume_24h: p.volume_24h,
          price_usd: p.price_usd,
          price_change_24h: p.price_change_24h,
          created_at: p.created_at,
        })),
      },
      classification_summary: classificationSummary,
      analyzed_at: new Date().toISOString(),
    };

    // Cache the full analysis with 10 minute TTL
    await setCache(cacheKey, analysis, 600);

    reply.send(analysis);
  } catch (error: any) {
    console.error('Error analyzing token:', error);
    reply.code(500).send({
      error: 'Analysis failed',
      details: error.message || 'Unknown error occurred',
    } as ErrorResponse);
  }
}

export async function analyzeRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/v1/analyze', analyzeToken);
}
