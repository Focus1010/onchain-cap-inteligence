import { getMoralis, BASE_CHAIN_ID, initMoralis } from './moralis';
import { getCache, setCache, generateCacheKey } from './redis';
import { classifyAddress, ClassificationType } from './classification.service';
import { getTokenPools, Pool } from './dexscreener.service';

export interface TokenAnalysis {
  token: {
    name: string;
    symbol: string;
    total_supply_formatted: string;
    logo: string | null;
    verified_contract: boolean;
  };
  holders: {
    total_holders: number;
    top_holders: Array<{
      address: string;
      balance_formatted: string;
      percentage_relative_to_total_supply: number;
      is_contract: boolean;
      entity_label: string | null;
      classification: ClassificationType;
    }>;
  };
  concentration: {
    raw_top5: number;
    adjusted_top5: number;
    individual_holders: number;
    eoa_only_top5: Array<{
      address: string;
      balance_formatted: string;
      percentage_relative_to_total_supply: number;
      is_contract: boolean;
      entity_label: string | null;
      classification: ClassificationType;
    }>;
  };
  pools: {
    total_pools: number;
    total_liquidity_usd: number;
    total_volume_24h: number;
    pools: Array<{
      pair_address: string;
      dex_name: string;
      base_token_symbol: string;
      quote_token_symbol: string;
      liquidity_usd: number;
      volume_24h: number;
      price_usd: number;
      price_change_24h: number;
      created_at: string;
    }>;
  };
  classification_summary: {
    eoa_count: number;
    smart_wallet_count: number;
    lp_count: number;
    staking_count: number;
    multisig_count: number;
    burn_count: number;
    unknown_contract_count: number;
  };
  analyzed_at: string;
}

export async function getTokenAnalysis(address: string): Promise<TokenAnalysis> {
  // Check cache first
  const cacheKey = generateCacheKey('analyze', address);
  const cached = await getCache<TokenAnalysis>(cacheKey);
  if (cached) {
    return cached;
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
  const analysis: TokenAnalysis = {
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
        created_at: p.created_at || '',
      })),
    },
    classification_summary: classificationSummary,
    analyzed_at: new Date().toISOString(),
  };

  // Cache the full analysis with 10 minute TTL
  await setCache(cacheKey, analysis, 600);

  return analysis;
}
