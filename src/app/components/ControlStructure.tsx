import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'motion/react';

interface ControlStructureProps {
  classificationSummary?: {
    eoa_count: number;
    smart_wallet_count: number;
    lp_count: number;
    staking_count: number;
    multisig_count: number;
    burn_count: number;
    unknown_contract_count: number;
  };
  totalHolders: number;
}

const COLORS = {
  'EOA': '#10B981',
  'Liquidity Pools': '#3B82F6',
  'DAO': '#F59E0B',
  'Staking': '#06B6D4',
  'Smart Wallet': '#8B5CF6',
  'Burn': '#6B7280',
  'Unknown': '#9CA3AF',
};

export function ControlStructure({ classificationSummary, totalHolders }: ControlStructureProps) {
  // Calculate real data from classification summary
  const data = classificationSummary && totalHolders > 0
    ? [
        { name: 'EOA', value: parseFloat(((classificationSummary.eoa_count + classificationSummary.smart_wallet_count) / totalHolders * 100).toFixed(1)), color: COLORS['EOA'] },
        { name: 'Liquidity Pools', value: parseFloat((classificationSummary.lp_count / totalHolders * 100).toFixed(1)), color: COLORS['Liquidity Pools'] },
        { name: 'DAO', value: parseFloat((classificationSummary.multisig_count / totalHolders * 100).toFixed(1)), color: COLORS['DAO'] },
        { name: 'Staking', value: parseFloat((classificationSummary.staking_count / totalHolders * 100).toFixed(1)), color: COLORS['Staking'] },
        { name: 'Burn', value: parseFloat((classificationSummary.burn_count / totalHolders * 100).toFixed(1)), color: COLORS['Burn'] },
        { name: 'Unknown', value: parseFloat((classificationSummary.unknown_contract_count / totalHolders * 100).toFixed(1)), color: COLORS['Unknown'] },
      ].filter(d => d.value > 0)
    : [
        { name: 'EOA', value: 36, color: COLORS['EOA'] },
        { name: 'Liquidity Pools', value: 28, color: COLORS['Liquidity Pools'] },
        { name: 'DAO', value: 14, color: COLORS['DAO'] },
        { name: 'Staking', value: 10, color: COLORS['Staking'] },
        { name: 'Burn', value: 3, color: COLORS['Burn'] },
      ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        className="bg-[#11161D] border border-[#1E2630] rounded-xl p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl font-semibold text-[#F9FAFB] mb-2">Control Structure Distribution</h2>
          <p className="text-sm md:text-base text-[#9CA3AF] mb-8">
            Breakdown of token supply by holder classification
          </p>
        </motion.div>

        {/* Donut Chart */}
        <motion.div 
          className="mb-8" 
          style={{ height: window.innerWidth < 768 ? '300px' : '400px' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={window.innerWidth < 768 ? 60 : 100}
                outerRadius={window.innerWidth < 768 ? 100 : 160}
                paddingAngle={2}
                dataKey="value"
                animationBegin={400}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#11161D',
                  border: '1px solid #1E2630',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value: number) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
          {data.map((item, index) => (
            <motion.div 
              key={item.name} 
              className="flex items-center justify-between p-3 md:p-4 bg-[#0B0F14] rounded-lg border border-[#1E2630] cursor-pointer hover:bg-[#1E2630]/30 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full shadow-lg" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm md:text-base text-[#F9FAFB]">{item.name}</span>
              </div>
              <span className="text-sm md:text-base text-[#F9FAFB] font-semibold">{item.value}%</span>
            </motion.div>
          ))}
        </div>

        {/* Explanation */}
        <motion.div 
          className="bg-[#0B0F14] border border-[#1E2630] rounded-lg p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h3 className="text-base md:text-lg font-semibold text-[#F9FAFB] mb-4">Distribution Analysis</h3>
          <div className="space-y-3 text-sm md:text-base text-[#9CA3AF]">
            <p>
              The control structure shows a relatively balanced distribution with no single holder type dominating the supply.
            </p>
            <p>
              <strong className="text-[#F9FAFB]">EOAs (36%)</strong> represent individual wallets and are the largest category, 
              indicating retail and individual holder participation.
            </p>
            <p>
              <strong className="text-[#F9FAFB]">Liquidity Pools (28%)</strong> demonstrate healthy DEX liquidity, 
              essential for trading and price discovery.
            </p>
            <p>
              <strong className="text-[#F9FAFB]">DAO Treasury (14%)</strong> shows governance-controlled reserves, 
              typically used for protocol development and community initiatives.
            </p>
            <p>
              The remaining supply is distributed across staking contracts, smart wallets, and burn addresses, 
              contributing to the overall token utility and scarcity.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}