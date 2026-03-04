import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { motion } from 'motion/react';

type HolderType = 'EOA' | 'LP' | 'Smart Wallet' | 'DAO' | 'Staking' | 'Burn';

interface Holder {
  rank: number;
  address: string;
  label?: string;
  type: HolderType;
  percentage: number;
  balance: string;
}

const holderColors = {
  'EOA': '#10B981',
  'LP': '#3B82F6',
  'Smart Wallet': '#8B5CF6',
  'DAO': '#F59E0B',
  'Staking': '#06B6D4',
  'Burn': '#6B7280',
};

const mockHolders: Holder[] = [
  { rank: 1, address: '0x1234...5678', label: 'Uniswap V3 Pool', type: 'LP', percentage: 28, balance: '280,000,000' },
  { rank: 2, address: '0xabcd...ef01', type: 'EOA', percentage: 18, balance: '180,000,000' },
  { rank: 3, address: '0x9876...5432', label: 'Treasury', type: 'DAO', percentage: 14, balance: '140,000,000' },
  { rank: 4, address: '0x2468...1357', type: 'EOA', percentage: 12, balance: '120,000,000' },
  { rank: 5, address: '0x1357...2468', label: 'Staking Contract', type: 'Staking', percentage: 10, balance: '100,000,000' },
  { rank: 6, address: '0xdef0...abcd', type: 'Smart Wallet', percentage: 6, balance: '60,000,000' },
  { rank: 7, address: '0x7890...4321', type: 'EOA', percentage: 4, balance: '40,000,000' },
  { rank: 8, address: '0x5678...9012', type: 'Smart Wallet', percentage: 3, balance: '30,000,000' },
  { rank: 9, address: '0x0000...dead', label: 'Burn Address', type: 'Burn', percentage: 3, balance: '30,000,000' },
  { rank: 10, address: '0x3456...7890', type: 'EOA', percentage: 2, balance: '20,000,000' },
  { rank: 11, address: '0xbcde...4567', type: 'EOA', percentage: 1.5, balance: '15,000,000' },
  { rank: 12, address: '0x6789...abcd', type: 'Smart Wallet', percentage: 1.5, balance: '15,000,000' },
];

type SortKey = 'rank' | 'percentage' | 'balance';

export function Holders() {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedHolder, setSelectedHolder] = useState<Holder | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedHolders = [...mockHolders].sort((a, b) => {
    let comparison = 0;
    
    if (sortKey === 'rank') {
      comparison = a.rank - b.rank;
    } else if (sortKey === 'percentage') {
      comparison = a.percentage - b.percentage;
    } else if (sortKey === 'balance') {
      comparison = parseFloat(a.balance.replace(/,/g, '')) - parseFloat(b.balance.replace(/,/g, ''));
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#11161D] border border-[#1E2630] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E2630]">
                <th className="text-left px-6 py-4">
                  <button
                    onClick={() => handleSort('rank')}
                    className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium"
                  >
                    Rank
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left px-6 py-4 text-[#9CA3AF] font-medium">Address</th>
                <th className="text-left px-6 py-4 text-[#9CA3AF] font-medium">Label</th>
                <th className="text-left px-6 py-4 text-[#9CA3AF] font-medium">Type</th>
                <th className="text-left px-6 py-4">
                  <button
                    onClick={() => handleSort('percentage')}
                    className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium"
                  >
                    % of Supply
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left px-6 py-4">
                  <button
                    onClick={() => handleSort('balance')}
                    className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium"
                  >
                    Balance
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHolders.map((holder, index) => (
                <motion.tr 
                  key={holder.address} 
                  className={`border-b border-[#1E2630] hover:bg-[#1E2630]/30 transition-colors cursor-pointer ${
                    index === sortedHolders.length - 1 ? 'border-b-0' : ''
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  whileHover={{ backgroundColor: 'rgba(30, 38, 48, 0.5)' }}
                  onClick={() => setSelectedHolder(holder)}
                >
                  <td className="px-6 py-4 text-[#F9FAFB] font-medium">{holder.rank}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[#F9FAFB]">{holder.address}</span>
                  </td>
                  <td className="px-6 py-4 text-[#9CA3AF]">
                    {holder.label || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: holderColors[holder.type] }}
                      />
                      <span className="text-[#F9FAFB]">{holder.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#F9FAFB] font-semibold">
                    {holder.percentage}%
                  </td>
                  <td className="px-6 py-4 text-[#F9FAFB]">
                    {holder.balance}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {sortedHolders.map((holder, index) => (
          <motion.div
            key={holder.address}
            className="bg-[#11161D] border border-[#1E2630] rounded-xl p-4 cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedHolder(holder)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-[#06B6D4] font-bold text-lg">#{holder.rank}</div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: holderColors[holder.type] }}
                  />
                  <span className="text-[#9CA3AF] text-sm">{holder.type}</span>
                </div>
              </div>
              <div className="text-[#06B6D4] font-bold text-lg">{holder.percentage}%</div>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="text-[#6B7280] text-xs mb-1">Address</div>
                <div className="text-[#F9FAFB] font-mono text-sm">{holder.address}</div>
              </div>
              
              {holder.label && (
                <div>
                  <div className="text-[#6B7280] text-xs mb-1">Label</div>
                  <div className="text-[#F9FAFB] text-sm font-medium">{holder.label}</div>
                </div>
              )}
              
              <div>
                <div className="text-[#6B7280] text-xs mb-1">Balance</div>
                <div className="text-[#F9FAFB] text-sm font-medium">{holder.balance}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Holder Modal (Mobile & Desktop) */}
      {selectedHolder && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedHolder(null)}
        >
          <motion.div
            className="bg-[#11161D] border-2 border-[#06B6D4]/50 rounded-2xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#F9FAFB]">Holder Details</h3>
              <button
                onClick={() => setSelectedHolder(null)}
                className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-[#6B7280] text-sm mb-2">Rank</div>
                <div className="text-[#06B6D4] text-3xl font-bold">#{selectedHolder.rank}</div>
              </div>
              
              <div>
                <div className="text-[#6B7280] text-sm mb-2">Address</div>
                <div className="text-[#F9FAFB] font-mono text-lg break-all">{selectedHolder.address}</div>
              </div>
              
              {selectedHolder.label && (
                <div>
                  <div className="text-[#6B7280] text-sm mb-2">Label</div>
                  <div className="text-[#F9FAFB] text-lg font-semibold">{selectedHolder.label}</div>
                </div>
              )}
              
              <div>
                <div className="text-[#6B7280] text-sm mb-2">Type</div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: holderColors[selectedHolder.type] }}
                  />
                  <span className="text-[#F9FAFB] text-lg font-semibold">{selectedHolder.type}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1E2630]">
                <div>
                  <div className="text-[#6B7280] text-sm mb-2">% of Supply</div>
                  <div className="text-[#06B6D4] text-2xl font-bold">{selectedHolder.percentage}%</div>
                </div>
                <div>
                  <div className="text-[#6B7280] text-sm mb-2">Balance</div>
                  <div className="text-[#F9FAFB] text-lg font-semibold">{selectedHolder.balance}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}