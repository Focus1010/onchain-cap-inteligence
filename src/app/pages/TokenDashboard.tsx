import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Radar, ArrowLeft, Copy, ExternalLink, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { BubbleMap } from '../components/BubbleMap';
import { Holders } from '../components/Holders';
import { ControlStructure } from '../components/ControlStructure';
import { Metrics } from '../components/Metrics';
import { analyzeToken, getTokenRiskScore, type TokenAnalysis, type RiskScoreResult } from '../../api/capintel';

type Tab = 'bubble' | 'holders' | 'control' | 'metrics';

export function TokenDashboard() {
  const { address } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('bubble');
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [riskScore, setRiskScore] = useState<RiskScoreResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    
    const fetchData = async () => {
      setLoading(true);
      const [analysisData, riskData] = await Promise.all([
        analyzeToken(address),
        getTokenRiskScore(address),
      ]);
      setAnalysis(analysisData);
      setRiskScore(riskData);
      setLoading(false);
    };

    fetchData();
  }, [address]);

  const tabs = [
    { id: 'bubble' as Tab, label: 'Bubble Map' },
    { id: 'holders' as Tab, label: 'Holders' },
    { id: 'control' as Tab, label: 'Control' },
    { id: 'metrics' as Tab, label: 'Metrics' },
  ];

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen relative" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Animated background */}
      <div className="fixed inset-0 bg-[#0B0F14]">
        <motion.div
          className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(#06B6D4 1px, transparent 1px), linear-gradient(90deg, #06B6D4 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Navigation */}
      <motion.nav 
        className="relative border-b border-[#1E2630]/50 bg-[#0B0F14]/80 backdrop-blur-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <Link to="/">
              <motion.div 
                className="flex items-center gap-2 md:gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="relative">
                  <Radar className="w-6 h-6 md:w-7 md:h-7 text-[#06B6D4]" />
                  <motion.div
                    className="absolute inset-0 bg-[#06B6D4] rounded-full blur-xl opacity-40"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <span className="text-lg md:text-xl font-bold text-[#F9FAFB] tracking-tight">CHR</span>
              </motion.div>
            </Link>
            <motion.div 
              className="hidden md:flex items-center gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/">
                <motion.button
                  className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-[#11161D]"
                  whileHover={{ x: -3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </motion.button>
              </Link>
            </motion.div>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <motion.a 
              href="#" 
              className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium"
              whileHover={{ y: -2 }}
            >
              Docs
            </motion.a>
            <motion.a 
              href="#" 
              className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium"
              whileHover={{ y: -2 }}
            >
              About
            </motion.a>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-[#1E2630]/50 bg-[#11161D]/95 backdrop-blur-xl"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/">
                <button className="w-full flex items-center gap-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium px-3 py-2 rounded-lg hover:bg-[#1E2630]">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </Link>
              <a href="#" className="block text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium px-3 py-2 rounded-lg hover:bg-[#1E2630]">
                Docs
              </a>
              <a href="#" className="block text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium px-3 py-2 rounded-lg hover:bg-[#1E2630]">
                About
              </a>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Token Info Strip */}
      <motion.div 
        className="relative border-b border-[#1E2630]/50 bg-gradient-to-br from-[#11161D]/80 to-[#0B0F14]/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
            <motion.div 
              className="w-full lg:w-auto"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <h2 className="text-xl md:text-3xl font-bold text-[#F9FAFB]">
                  {loading ? 'Loading...' : analysis?.token.name || 'Unknown'}
                </h2>
                <span className="text-[#9CA3AF] font-semibold text-base md:text-lg">
                  {loading ? '' : analysis?.token.symbol || ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-[#6B7280]">
                <span className="font-mono truncate max-w-[200px] md:max-w-none">{address}</span>
                <motion.button
                  onClick={handleCopyAddress}
                  className="p-1 hover:text-[#06B6D4] transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {copied ? '✓' : <Copy className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                </motion.button>
                <motion.a
                  href="#"
                  className="p-1 hover:text-[#06B6D4] transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                >
                  <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </motion.a>
              </div>
            </motion.div>
            
            <motion.div 
              className="w-full lg:w-auto grid grid-cols-2 lg:flex lg:items-center gap-4 md:gap-8 text-sm"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div>
                <div className="text-[#6B7280] mb-1 font-medium text-xs md:text-sm">Total Supply</div>
                <div className="text-[#F9FAFB] font-bold text-sm md:text-lg">
                  {loading ? '...' : analysis?.token.total_supply_formatted || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-[#6B7280] mb-1 font-medium text-xs md:text-sm">Network</div>
                <div className="text-[#F9FAFB] font-bold text-sm md:text-lg">Base</div>
              </div>
              <div>
                <div className="text-[#6B7280] mb-1 font-medium text-xs md:text-sm">Deployer</div>
                <div className="text-[#F9FAFB] font-mono font-bold text-xs md:text-base">N/A</div>
              </div>
              <div>
                <div className="text-[#6B7280] mb-1 font-medium text-xs md:text-sm">Risk</div>
                <motion.div 
                  className={`inline-block px-3 md:px-4 py-1 md:py-1.5 rounded-xl font-bold shadow-lg text-xs md:text-sm ${
                    riskScore?.risk_level === 'LOW' ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30' :
                    riskScore?.risk_level === 'MEDIUM' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' :
                    riskScore?.risk_level === 'HIGH' ? 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30' :
                    'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {loading ? '...' : riskScore?.risk_level || 'N/A'}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div 
        className="relative border-b border-[#1E2630]/50 bg-[#0B0F14]/60 backdrop-blur-sm overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-1 md:gap-2 min-w-max md:min-w-0">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 md:px-6 py-3 md:py-4 font-semibold transition-all relative text-sm md:text-base whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#06B6D4]'
                    : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
                }`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-t-full shadow-lg shadow-[#06B6D4]/50"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-64"
          >
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#06B6D4]/30 border-t-[#06B6D4] animate-spin" />
              <span className="text-[#9CA3AF] font-medium">Analyzing token...</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'bubble' && <BubbleMap holders={analysis?.holders.top_holders || []} />}
            {activeTab === 'holders' && <Holders holders={analysis?.holders.top_holders || []} />}
            {activeTab === 'control' && <ControlStructure classificationSummary={analysis?.classification_summary} totalHolders={analysis?.holders.total_holders || 0} />}
            {activeTab === 'metrics' && (
              <Metrics
                concentration={analysis?.concentration}
                riskScore={riskScore}
                totalHolders={analysis?.holders.total_holders || 0}
                pools={analysis?.pools}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}