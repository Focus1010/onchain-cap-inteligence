import { useState } from 'react';
import { motion } from 'motion/react';
import { Radar } from 'lucide-react';
import { SearchBar } from '../../components/SearchBar';
import { TokenDashboard } from '../../components/TokenDashboard';
import { TokenResponse } from '../../types/api';

export function ApiTest() {
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleTokenFound = (data: TokenResponse) => {
    setTokenData(data);
    setError('');
    setHasSearched(true);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTokenData(null);
    setHasSearched(true);
  };

  const handleNewSearch = () => {
    setTokenData(null);
    setError('');
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen relative" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Background */}
      <div className="fixed inset-0 bg-[#0B0F14]">
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
        className="relative border-b border-[#1E2630]/50 bg-[#0B0F14]/80 backdrop-blur-xl z-10"
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
            <span className="text-lg md:text-xl font-bold text-[#F9FAFB] tracking-tight">API Test</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-73px)] px-4 py-8">
        <div className="w-full max-w-6xl">
          {!tokenData && !hasSearched && (
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4">
                Backend API
                <span className="bg-gradient-to-r from-[#06B6D4] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                  {' '}Integration Test
                </span>
              </h1>
              <p className="text-xl text-[#9CA3AF] mb-8">
                Test backend API with real Base token addresses
              </p>
              <p className="text-sm text-[#6B7280] mb-4">
                Backend URL: http://localhost:3001
              </p>
            </motion.div>
          )}

          {/* Search Bar */}
          <SearchBar onTokenFound={handleTokenFound} onError={handleError} />

          {/* Error Display */}
          {error && (
            <motion.div
              className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-400 font-medium">{error}</p>
            </motion.div>
          )}

          {/* Token Dashboard */}
          {tokenData && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 text-center">
                <button
                  onClick={handleNewSearch}
                  className="px-4 py-2 bg-[#1E2630] hover:bg-[#2D3748] text-[#F9FAFB] rounded-lg transition-colors"
                >
                  ← Analyze Another Token
                </button>
              </div>
              <TokenDashboard tokenData={tokenData} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
