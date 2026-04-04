import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Radar, TrendingUp, Shield, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export function Landing() {
  const [address, setAddress] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (address.trim()) {
      navigate(`/token/${address.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-[#0B0F14]">
        {/* Animated orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-48 md:w-64 h-48 md:h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 20, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03]"
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
            <span className="text-lg md:text-xl font-bold text-[#F9FAFB] tracking-tight">CapIntel</span>
          </motion.div>
          <div className="flex items-center gap-4 md:gap-6">
            <motion.a 
              href="#" 
              className="text-sm md:text-base text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium hidden md:block"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Docs
            </motion.a>
            <motion.a 
              href="#" 
              className="text-sm md:text-base text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium hidden md:block"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              About
            </motion.a>
            <motion.select 
              className="bg-[#11161D]/80 backdrop-blur-sm text-[#F9FAFB] border border-[#1E2630] rounded-xl px-3 md:px-4 py-1.5 md:py-2.5 outline-none focus:border-[#06B6D4] transition-all font-medium text-sm md:text-base"
              whileHover={{ scale: 1.02 }}
            >
              <option>Base</option>
              <option>Ethereum</option>
              <option>Polygon</option>
              <option>Arbitrum</option>
            </motion.select>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative flex items-center justify-center min-h-[calc(100vh-73px)] px-4">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="inline-block mb-4 md:mb-6 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="text-[#06B6D4] font-semibold text-xs md:text-sm tracking-wide">POWERED BY ONCHAIN DATA</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#F9FAFB] mb-4 md:mb-6 leading-tight tracking-tight px-2">
              Onchain Cap Table
              <br />
              <span className="bg-gradient-to-r from-[#06B6D4] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>
            
            <p className="text-base md:text-xl text-[#9CA3AF] mb-8 md:mb-12 font-medium max-w-2xl mx-auto leading-relaxed px-2">
              Understand who really controls a token. Analyze holder distribution, detect patterns, and make informed decisions.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div 
            className="flex items-center justify-center gap-2 md:gap-4 mb-8 md:mb-12 flex-wrap px-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { icon: TrendingUp, text: 'Real-time Analysis' },
              { icon: Shield, text: 'Risk Detection' },
              { icon: Activity, text: 'Live Monitoring' }
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-[#11161D]/60 backdrop-blur-sm border border-[#1E2630]/50"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(17, 22, 29, 0.9)' }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <feature.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#06B6D4]" />
                <span className="text-xs md:text-sm text-[#9CA3AF] font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Search Input */}
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div 
              className="relative"
              animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl blur-xl"
                animate={{
                  background: isFocused 
                    ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))' 
                    : 'transparent'
                }}
                transition={{ duration: 0.3 }}
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Paste contract address 0x..."
                className="relative w-full bg-[#11161D]/80 backdrop-blur-xl text-[#F9FAFB] border-2 border-[#1E2630] rounded-2xl px-6 md:px-8 py-4 md:py-6 text-base md:text-lg outline-none focus:border-[#06B6D4] transition-all placeholder:text-[#6B7280] font-medium shadow-2xl"
              />
            </motion.div>
            
            <motion.button
              onClick={handleAnalyze}
              className="mt-4 md:mt-6 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:from-[#0891B2] hover:to-[#0e7490] text-[#0B0F14] px-10 md:px-14 py-3 md:py-4 rounded-2xl font-bold text-base md:text-lg transition-all shadow-lg shadow-[#06B6D4]/20 relative overflow-hidden w-full md:w-auto"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(6, 182, 212, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">Analyze Token</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}