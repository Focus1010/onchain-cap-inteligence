import { TrendingUp, TrendingDown, Users, Wallet, Droplets, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import type { TokenAnalysis, RiskScoreResult } from '../../api/capintel';

interface MetricsProps {
  concentration?: TokenAnalysis['concentration'];
  riskScore?: RiskScoreResult | null;
  totalHolders: number;
  pools?: TokenAnalysis['pools'];
}

interface MetricCard {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
}

// Format currency with $XXX,XXX format
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function Metrics({ concentration, riskScore, totalHolders, pools }: MetricsProps) {
  const metrics: MetricCard[] = [
    {
      title: 'Total Holders',
      value: totalHolders.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Top 5 Raw',
      value: `${concentration?.raw_top5?.toFixed(1) || '0.0'}%`,
      icon: <Wallet className="w-6 h-6" />,
    },
    {
      title: 'Top 5 Adjusted',
      value: `${concentration?.adjusted_top5?.toFixed(1) || '0.0'}%`,
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: 'Total Pools',
      value: pools?.total_pools?.toString() || '0',
      icon: <Layers className="w-6 h-6" />,
    },
    {
      title: 'Total Liquidity',
      value: formatCurrency(pools?.total_liquidity_usd || 0),
      icon: <Droplets className="w-6 h-6" />,
    },
    {
      title: 'Risk Score',
      value: riskScore ? `${riskScore.risk_score}/100` : 'N/A',
      icon: <TrendingDown className="w-6 h-6" />,
    },
  ];

  const concentrationMetrics = [
    { label: 'Top 1%', value: '42%' },
    { label: 'Top 5%', value: '68%' },
    { label: 'Top 10%', value: '82%' },
    { label: 'Top 25%', value: '94%' },
  ];

  const holderDistribution = [
    { range: '< 1K', holders: '8,234', percentage: '65.6%' },
    { range: '1K - 10K', holders: '2,891', percentage: '23.0%' },
    { range: '10K - 100K', holders: '1,124', percentage: '9.0%' },
    { range: '100K - 1M', holders: '234', percentage: '1.9%' },
    { range: '> 1M', holders: '60', percentage: '0.5%' },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            className="bg-[#11161D] border border-[#1E2630] rounded-xl p-5 md:p-6 hover:border-[#06B6D4]/30 transition-colors cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ scale: 1.03, borderColor: 'rgba(6, 182, 212, 0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-[#06B6D4]">{metric.icon}</div>
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-[#F9FAFB] mb-1">{metric.value}</div>
            <div className="text-sm text-[#9CA3AF]">{metric.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Concentration Analysis */}
      <motion.div 
        className="bg-[#11161D] border border-[#1E2630] rounded-xl p-5 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h3 className="text-base md:text-lg font-semibold text-[#F9FAFB] mb-6">Concentration Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {concentrationMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="bg-[#0B0F14] border border-[#1E2630] rounded-lg p-3 md:p-4 text-center cursor-pointer hover:bg-[#1E2630]/30 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xl md:text-2xl font-semibold text-[#06B6D4] mb-1">{metric.value}</div>
              <div className="text-xs md:text-sm text-[#9CA3AF]">{metric.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.div 
          className="mt-6 p-4 bg-[#0B0F14] border border-[#1E2630] rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <p className="text-sm text-[#9CA3AF]">
            The Gini coefficient of 0.72 indicates moderate concentration. A lower coefficient would suggest 
            more equal distribution among holders. Top 10% of holders control 82% of the supply.
          </p>
        </motion.div>
      </motion.div>

      {/* Holder Distribution */}
      <motion.div 
        className="bg-[#11161D] border border-[#1E2630] rounded-xl p-5 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3 className="text-base md:text-lg font-semibold text-[#F9FAFB] mb-6">Holder Distribution by Balance</h3>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E2630]">
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">Balance Range</th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">Number of Holders</th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">% of Total Holders</th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {holderDistribution.map((row, index) => (
                <motion.tr
                  key={row.range}
                  className={`border-b border-[#1E2630] hover:bg-[#1E2630]/30 transition-colors ${
                    index === holderDistribution.length - 1 ? 'border-b-0' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                >
                  <td className="px-4 py-4 text-[#F9FAFB] font-mono">{row.range}</td>
                  <td className="px-4 py-4 text-[#F9FAFB]">{row.holders}</td>
                  <td className="px-4 py-4 text-[#F9FAFB]">{row.percentage}</td>
                  <td className="px-4 py-4">
                    <div className="w-full bg-[#1E2630] rounded-full h-2">
                      <motion.div
                        className="bg-[#06B6D4] h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: row.percentage }}
                        transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {holderDistribution.map((row, index) => (
            <motion.div
              key={row.range}
              className="bg-[#0B0F14] border border-[#1E2630] rounded-lg p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[#06B6D4] font-semibold">{row.range}</div>
                <div className="text-[#F9FAFB] font-bold">{row.percentage}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Holders</span>
                  <span className="text-[#F9FAFB]">{row.holders}</span>
                </div>
                <div className="w-full bg-[#1E2630] rounded-full h-2">
                  <motion.div
                    className="bg-[#06B6D4] h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: row.percentage }}
                    transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Risk Assessment */}
      <motion.div 
        className="bg-[#11161D] border border-[#1E2630] rounded-xl p-5 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <h3 className="text-base md:text-lg font-semibold text-[#F9FAFB] mb-6">Risk Assessment</h3>
        <div className="space-y-4">
          {[
            { color: '#10B981', title: 'Distribution Risk: Low', description: 'Healthy distribution across holder types with no excessive concentration in EOAs' },
            { color: '#10B981', title: 'Liquidity Risk: Low', description: '28% of supply in liquidity pools provides strong trading depth' },
            { color: '#F59E0B', title: 'Concentration Risk: Medium', description: 'Top 5 holders control 72% of supply (including LP and DAO)' },
            { color: '#10B981', title: 'Governance Risk: Low', description: 'DAO treasury and staking contracts are properly distributed' }
          ].map((risk, index) => (
            <motion.div 
              key={risk.title}
              className="flex items-start gap-4 p-3 md:p-4 bg-[#0B0F14] border border-[#1E2630] rounded-lg hover:bg-[#1E2630]/30 transition-colors cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.3)' }}
            >
              <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: risk.color }} />
              <div className="flex-1">
                <div className="text-[#F9FAFB] font-medium mb-1 text-sm md:text-base">{risk.title}</div>
                <div className="text-xs md:text-sm text-[#9CA3AF]">
                  {risk.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}