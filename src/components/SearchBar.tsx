import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { TokenApiService, ApiError } from '../services/api';

interface SearchBarProps {
  onTokenFound: (tokenData: any) => void;
  onError: (error: string) => void;
}

export function SearchBar({ onTokenFound, onError }: SearchBarProps) {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validateAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      onError('Please enter a contract address');
      return;
    }

    if (!validateAddress(address.trim())) {
      onError('Invalid Ethereum address format. Must start with 0x and be 42 characters long.');
      return;
    }

    setIsLoading(true);
    onError(''); // Clear any previous errors

    try {
      const tokenData = await TokenApiService.fetchToken(address.trim());
      onTokenFound(tokenData);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        onError(error.message);
      } else {
        onError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <motion.div 
          className="relative"
          animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Glow effect when focused */}
          <motion.div
            className="absolute inset-0 rounded-2xl blur-xl"
            animate={{
              background: isFocused 
                ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))' 
                : 'transparent'
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Input field */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Paste contract address 0x..."
              className="relative w-full bg-[#11161D]/80 backdrop-blur-xl text-[#F9FAFB] border-2 border-[#1E2630] rounded-2xl pl-12 pr-16 py-4 text-lg outline-none focus:border-[#06B6D4] transition-all placeholder:text-[#6B7280] font-medium shadow-2xl"
              disabled={isLoading}
            />
            
            {/* Loading spinner or submit button */}
            <div className="absolute right-2">
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="p-2"
                >
                  <Loader2 className="w-5 h-5 text-[#06B6D4]" />
                </motion.div>
              ) : (
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:from-[#0891B2] hover:to-[#0e7490] text-[#0B0F14] rounded-xl font-semibold transition-all shadow-lg shadow-[#06B6D4]/20 relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative z-10">Analyze</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Address format hint */}
        {address && !validateAddress(address) && (
          <motion.p
            className="mt-2 text-sm text-[#EF4444] font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Invalid address format. Expected: 0x followed by 40 hexadecimal characters
          </motion.p>
        )}

        {/* Valid address indicator */}
        {address && validateAddress(address) && !isLoading && (
          <motion.p
            className="mt-2 text-sm text-[#10B981] font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✓ Valid address format
          </motion.p>
        )}
      </form>
    </motion.div>
  );
}
