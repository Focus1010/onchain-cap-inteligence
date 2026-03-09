import React from 'react';
import { motion } from 'motion/react';
import { TokenApiService } from '../services/api';
import { TokenResponse } from '../types/api';

interface TokenDashboardProps {
  tokenData: TokenResponse;
}

export function TokenDashboard({ tokenData }: TokenDashboardProps) {
  const formattedHolders = TokenApiService.formatHolders(tokenData.holders);
  const formattedTotalSupply = TokenApiService.formatTotalSupply(tokenData.totalSupply);

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Token Info Header */}
      <motion.div 
        className="bg-[#11161D] border border-[#1E2630] rounded-xl p-6 md:p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F9FAFB] mb-2">
              {tokenData.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-xl md:text-2xl font-semibold text-[#06B6D4]">
                {tokenData.symbol}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div>
              <div className="text-sm text-[#9CA3AF] mb-1 font-medium">Total Supply</div>
              <div className="text-xl md:text-2xl font-bold text-[#F9FAFB]">
                {formattedTotalSupply}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#9CA3AF] mb-1 font-medium">Total Holders</div>
              <div className="text-xl md:text-2xl font-bold text-[#F9FAFB]">
                {tokenData.holders.length.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Holders Table */}
      <motion.div 
        className="bg-[#11161D] border border-[#1E2630] rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-6 border-b border-[#1E2630]">
          <h2 className="text-xl font-semibold text-[#F9FAFB]">Top 10 Holders</h2>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Largest token holders by balance
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E2630]">
                <th className="text-left px-6 py-4 text-sm font-medium text-[#9CA3AF]">Rank</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#9CA3AF]">Address</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#9CA3AF]">Balance</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#9CA3AF]">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {formattedHolders.map((holder: any, index: number) => (
                <motion.tr
                  key={holder.address}
                  className={`border-b border-[#1E2630]/50 hover:bg-[#1E2630]/20 transition-colors ${
                    index === formattedHolders.length - 1 ? 'border-b-0' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                >
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] font-semibold text-sm">
                      {holder.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-[#F9FAFB] bg-[#0B0F14] px-2 py-1 rounded">
                        {holder.shortAddress}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#F9FAFB]">
                      {holder.balance}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#06B6D4]">
                        {holder.percentage?.toFixed(2) || '0.00'}%
                      </span>
                      {/* Visual percentage bar */}
                      <div className="w-16 bg-[#1E2630] rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-[#06B6D4] to-[#0891B2] h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(holder.percentage || 0, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }}
                        />
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary stats */}
        <motion.div 
          className="p-6 border-t border-[#1E2630] bg-[#0B0F14]/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-[#9CA3AF] mb-1">Top 1 Holder</div>
              <div className="font-semibold text-[#F9FAFB]">
                {formattedHolders[0]?.percentage?.toFixed(2) || '0.00'}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-[#9CA3AF] mb-1">Top 5 Holders</div>
              <div className="font-semibold text-[#F9FAFB]">
                {formattedHolders.slice(0, 5).reduce((sum: number, h: any) => sum + (h.percentage || 0), 0).toFixed(2)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-[#9CA3AF] mb-1">Top 10 Holders</div>
              <div className="font-semibold text-[#F9FAFB]">
                {formattedHolders.reduce((sum: number, h: any) => sum + (h.percentage || 0), 0).toFixed(2)}%
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
