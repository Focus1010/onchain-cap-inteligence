export type ClassificationType = 'eoa' | 'lp' | 'burn' | 'staking' | 'multisig' | 'smart_wallet' | 'contract';

interface HolderObject {
  address: string;
  is_contract: boolean;
  entity_label: string | null;
}

const BURN_ADDRESSES = [
  '0x000000000000000000000000000000000000dead',
  '0x0000000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000001',
];

export function classifyAddress(holder: HolderObject, poolAddresses: string[]): ClassificationType {
  const address = holder.address.toLowerCase();
  const entityLabel = (holder.entity_label || '').toLowerCase();

  // 1. EOA - is_contract is false
  if (!holder.is_contract) {
    return 'eoa';
  }

  // 2. Burn Address
  if (BURN_ADDRESSES.includes(address)) {
    return 'burn';
  }
  if (entityLabel.includes('burn') || entityLabel.includes('null') || entityLabel.includes('dead')) {
    return 'burn';
  }

  // 3. Liquidity Pool
  if (poolAddresses.includes(address)) {
    return 'lp';
  }
  const lpKeywords = ['pool', 'lp', 'liquidity', 'uniswap', 'aerodrome', 'baseswap', 'sushiswap'];
  if (lpKeywords.some(keyword => entityLabel.includes(keyword))) {
    return 'lp';
  }

  // 4. Staking Contract
  const stakingKeywords = ['staking', 'stake', 'vault', 'farm', 'yield'];
  if (stakingKeywords.some(keyword => entityLabel.includes(keyword))) {
    return 'staking';
  }

  // 5. Multisig / DAO
  const multisigKeywords = ['dao', 'treasury', 'multisig', 'gnosis', 'safe'];
  if (multisigKeywords.some(keyword => entityLabel.includes(keyword))) {
    return 'multisig';
  }

  // 6. Smart Wallet (treat as EOA for control purposes)
  const smartWalletKeywords = ['smart wallet', 'coinbase smart wallet', 'account abstraction', '4337'];
  if (smartWalletKeywords.some(keyword => entityLabel.includes(keyword))) {
    return 'smart_wallet';
  }

  // 7. Unknown Contract
  return 'contract';
}
