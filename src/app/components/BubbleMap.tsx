import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';

type HolderType = 'EOA' | 'LP' | 'Smart Wallet' | 'DAO' | 'Staking' | 'Burn';

interface BubbleMapProps {
  holders: Array<{
    address: string;
    balance_formatted: string;
    percentage_relative_to_total_supply: number;
    is_contract: boolean;
    entity_label: string | null;
    classification: 'eoa' | 'smart_wallet' | 'lp' | 'staking' | 'multisig' | 'burn' | 'contract';
  }>;
}

interface Bubble {
  id: string;
  address: string;
  type: HolderType;
  percentage: number;
  balance: string;
  label?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const holderColors = {
  'EOA': '#10B981',
  'LP': '#3B82F6',
  'Smart Wallet': '#8B5CF6',
  'DAO': '#F59E0B',
  'Staking': '#06B6D4',
  'Burn': '#6B7280',
};

// Map API classification to display type
function mapClassification(
  classification: 'eoa' | 'smart_wallet' | 'lp' | 'staking' | 'multisig' | 'burn' | 'contract',
  entityLabel: string | null
): HolderType {
  switch (classification) {
    case 'eoa':
    case 'contract':
      return 'EOA';
    case 'smart_wallet':
      return 'Smart Wallet';
    case 'lp':
      return 'LP';
    case 'multisig':
      return 'DAO';
    case 'staking':
      return 'Staking';
    case 'burn':
      return 'Burn';
    default:
      return 'EOA';
  }
}

// Truncate address for display
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function BubbleMap({ holders }: BubbleMapProps) {
  const [selectedBubble, setSelectedBubble] = useState<Bubble | null>(null);
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<HolderType | 'All'>('All');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; bubble: Bubble } | null>(null);
  
  // Transform holders to bubbles with physics properties
  const initialBubbles = useMemo(() => {
    return holders.slice(0, 10).map((h, index) => ({
      id: index.toString(),
      address: truncateAddress(h.address),
      type: mapClassification(h.classification, h.entity_label),
      percentage: parseFloat(h.percentage_relative_to_total_supply.toFixed(1)),
      balance: h.balance_formatted,
      label: h.entity_label || undefined,
      x: 200 + (index % 5) * 120 + Math.random() * 50,
      y: 150 + Math.floor(index / 5) * 200 + Math.random() * 50,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.sqrt(h.percentage_relative_to_total_supply) * 15 + 20,
    }));
  }, [holders]);
  
  const [bubbles, setBubbles] = useState<Bubble[]>(initialBubbles);
  const [draggedBubble, setDraggedBubble] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

  const filters: (HolderType | 'All')[] = ['All', 'EOA', 'LP', 'DAO', 'Staking', 'Smart Wallet'];

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = window.innerWidth < 768 ? 500 : 600;
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const filteredBubbles = useMemo(() => 
    activeFilter === 'All' 
      ? bubbles 
      : bubbles.filter(b => b.type === activeFilter),
    [activeFilter, bubbles]
  );

  // Optimized physics simulation - runs at 30fps instead of 60fps
  useEffect(() => {
    const targetFPS = 30;
    const frameDelay = 1000 / targetFPS;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastUpdateRef.current;
      
      if (elapsed >= frameDelay) {
        lastUpdateRef.current = now - (elapsed % frameDelay);
        
        setBubbles(prevBubbles => {
          return prevBubbles.map((bubble, i) => {
            if (draggedBubble === bubble.id) return bubble;

            let { x, y, vx, vy, radius } = bubble;

            // Apply velocity with smoother interpolation
            x += vx * 0.8;
            y += vy * 0.8;

            // Boundary collision with damping
            if (x - radius < 0) {
              x = radius;
              vx *= -0.6;
            }
            if (x + radius > dimensions.width) {
              x = dimensions.width - radius;
              vx *= -0.6;
            }
            if (y - radius < 0) {
              y = radius;
              vy *= -0.6;
            }
            if (y + radius > dimensions.height) {
              y = dimensions.height - radius;
              vy *= -0.6;
            }

            // Optimized collision detection - only check nearby bubbles
            for (let j = i + 1; j < prevBubbles.length; j++) {
              if (draggedBubble === prevBubbles[j].id) continue;
              
              const other = prevBubbles[j];
              const dx = other.x - x;
              const dy = other.y - y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const minDist = radius + other.radius;

              if (dist < minDist && dist > 0) {
                const angle = Math.atan2(dy, dx);
                const targetX = x + Math.cos(angle) * minDist;
                const targetY = y + Math.sin(angle) * minDist;
                
                const ax = (targetX - other.x) * 0.02;
                const ay = (targetY - other.y) * 0.02;
                
                vx -= ax;
                vy -= ay;
              }
            }

            // Apply stronger damping for stability
            vx *= 0.97;
            vy *= 0.97;

            // Stop very slow movement
            if (Math.abs(vx) < 0.005) vx = 0;
            if (Math.abs(vy) < 0.005) vy = 0;

            return { ...bubble, x, y, vx, vy };
          });
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draggedBubble, dimensions]);

  const handleBubbleClick = useCallback((bubble: Bubble) => {
    setSelectedBubble(bubble);
  }, []);

  const handleMouseEnter = useCallback((bubble: Bubble, event: React.MouseEvent) => {
    setHoveredBubble(bubble.id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        bubble,
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredBubble(null);
    setTooltip(null);
  }, []);

  const handleDragStart = useCallback((bubbleId: string) => {
    setDraggedBubble(bubbleId);
  }, []);

  const handleDrag = useCallback((bubbleId: string, event: any, info: any) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setBubbles(prev => prev.map(b => {
      if (b.id === bubbleId) {
        return {
          ...b,
          x: Math.max(b.radius, Math.min(dimensions.width - b.radius, info.point.x - rect.left)),
          y: Math.max(b.radius, Math.min(dimensions.height - b.radius, info.point.y - rect.top)),
          vx: info.velocity.x * 0.005,
          vy: info.velocity.y * 0.005,
        };
      }
      return b;
    }));
  }, [dimensions]);

  const handleDragEnd = useCallback(() => {
    setDraggedBubble(null);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Side - Bubble Visualization */}
      <div className="flex-1 w-full">
        {/* Filter Toggles */}
        <motion.div 
          className="mb-6 flex gap-2 flex-wrap"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {filters.map((filter, index) => (
            <motion.button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold transition-all text-sm md:text-base ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-[#0B0F14] shadow-lg shadow-[#06B6D4]/30'
                  : 'bg-[#11161D]/80 backdrop-blur-sm text-[#9CA3AF] hover:bg-[#1E2630] border border-[#1E2630]'
              }`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter}
            </motion.button>
          ))}
        </motion.div>

        {/* Bubble Map */}
        <motion.div 
          ref={containerRef}
          className="relative bg-gradient-to-br from-[#0B0F14]/90 via-[#11161D]/80 to-[#0B0F14]/90 backdrop-blur-xl rounded-2xl border border-[#1E2630]/50 overflow-hidden shadow-2xl w-full"
          style={{ height: dimensions.height }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Animated radial glow */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.15) 0%, transparent 60%)',
            }}
          />

          {/* Bubbles */}
          <svg className="w-full h-full">
            <defs>
              {/* Glassmorphism filter */}
              <filter id="glass">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo"/>
                <feBlend in="SourceGraphic" in2="goo"/>
              </filter>
            </defs>

            {filteredBubbles.map((bubble) => {
              const isHovered = hoveredBubble === bubble.id;
              const isDragged = draggedBubble === bubble.id;
              const isOtherHovered = hoveredBubble && hoveredBubble !== bubble.id;
              
              return (
                <g key={bubble.id}>
                  {/* Outer glow effect */}
                  <defs>
                    <radialGradient id={`glow-${bubble.id}`}>
                      <stop offset="0%" stopColor={holderColors[bubble.type]} stopOpacity="0.6" />
                      <stop offset="50%" stopColor={holderColors[bubble.type]} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={holderColors[bubble.type]} stopOpacity="0" />
                    </radialGradient>
                    <filter id={`blur-${bubble.id}`}>
                      <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                    </filter>
                  </defs>
                  
                  {/* Soft outer glow */}
                  <circle
                    cx={bubble.x}
                    cy={bubble.y}
                    r={bubble.radius + (isHovered || isDragged ? 20 : 15)}
                    fill={`url(#glow-${bubble.id})`}
                    style={{ 
                      pointerEvents: 'none',
                      filter: `url(#blur-${bubble.id})`,
                      transition: 'r 0.15s ease-out',
                    }}
                  />
                  
                  {/* Inner subtle fill */}
                  <circle
                    cx={bubble.x}
                    cy={bubble.y}
                    r={bubble.radius}
                    fill={holderColors[bubble.type]}
                    opacity="0.15"
                    style={{ pointerEvents: 'none' }}
                  />
                  
                  {/* Main ring stroke */}
                  <motion.circle
                    cx={bubble.x}
                    cy={bubble.y}
                    r={bubble.radius}
                    fill="none"
                    stroke={holderColors[bubble.type]}
                    strokeWidth={isHovered || isDragged ? "3" : "2"}
                    opacity={isOtherHovered ? 0.3 : 0.8}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: isOtherHovered ? 0.92 : 1,
                      opacity: isOtherHovered ? 0.3 : 0.8,
                    }}
                    transition={{
                      duration: 0.15,
                      ease: "easeOut"
                    }}
                    style={{ 
                      cursor: 'grab',
                      transformOrigin: `${bubble.x}px ${bubble.y}px`,
                      filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))',
                    }}
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    dragTransition={{ bounceStiffness: 600, bounceDamping: 20, power: 0 }}
                    onDragStart={() => handleDragStart(bubble.id)}
                    onDrag={(e, info) => handleDrag(bubble.id, e, info)}
                    onDragEnd={handleDragEnd}
                    onMouseEnter={(e: any) => handleMouseEnter(bubble, e)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleBubbleClick(bubble)}
                  />
                  
                  {/* Inner ring for depth */}
                  <circle
                    cx={bubble.x}
                    cy={bubble.y}
                    r={bubble.radius - 4}
                    fill="none"
                    stroke={holderColors[bubble.type]}
                    strokeWidth="1"
                    opacity="0.3"
                    style={{ 
                      pointerEvents: 'none',
                      transition: 'opacity 0.15s ease-out'
                    }}
                  />
                  
                  {/* Percentage text */}
                  <text
                    x={bubble.x}
                    y={bubble.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#F9FAFB"
                    fontSize={window.innerWidth < 768 ? "14" : "16"}
                    fontWeight="700"
                    style={{ 
                      pointerEvents: 'none', 
                      userSelect: 'none', 
                      textShadow: '0 2px 12px rgba(0,0,0,0.9)',
                      filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8))'
                    }}
                  >
                    {bubble.percentage}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <motion.div
              className="absolute bg-[#11161D]/95 backdrop-blur-xl border border-[#1E2630] rounded-xl p-4 pointer-events-none z-10 shadow-2xl hidden md:block"
              style={{
                left: tooltip.x + 15,
                top: tooltip.y + 15,
              }}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-sm space-y-2 min-w-[220px]">
                <div>
                  <div className="text-[#6B7280] text-xs font-medium mb-1">Address</div>
                  <div className="text-[#F9FAFB] font-mono font-semibold">{tooltip.bubble.address}</div>
                </div>
                {tooltip.bubble.label && (
                  <div>
                    <div className="text-[#6B7280] text-xs font-medium mb-1">Label</div>
                    <div className="text-[#F9FAFB] font-semibold">{tooltip.bubble.label}</div>
                  </div>
                )}
                <div>
                  <div className="text-[#6B7280] text-xs font-medium mb-1">Type</div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full shadow-lg" 
                      style={{ backgroundColor: holderColors[tooltip.bubble.type] }}
                    />
                    <span className="text-[#F9FAFB] font-semibold">{tooltip.bubble.type}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E2630]">
                  <div>
                    <div className="text-[#6B7280] text-xs font-medium mb-1">% of Supply</div>
                    <div className="text-[#06B6D4] font-bold text-lg">{tooltip.bubble.percentage}%</div>
                  </div>
                  <div>
                    <div className="text-[#6B7280] text-xs font-medium mb-1">Balance</div>
                    <div className="text-[#F9FAFB] font-semibold text-xs">{tooltip.bubble.balance}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Drag hint */}
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#6B7280] text-xs md:text-sm font-medium px-3 md:px-4 py-1.5 md:py-2 bg-[#11161D]/80 backdrop-blur-sm rounded-lg border border-[#1E2630]/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            💡 Drag bubbles • Click to select
          </motion.div>
        </motion.div>

        {/* Legend */}
        <motion.div 
          className="mt-6 flex gap-4 md:gap-6 flex-wrap"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {Object.entries(holderColors).map(([type, color], index) => (
            <motion.div 
              key={type} 
              className="flex items-center gap-2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
              whileHover={{ scale: 1.1, y: -2 }}
            >
              <div 
                className="w-3 h-3 md:w-4 md:h-4 rounded-full shadow-lg" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs md:text-sm text-[#9CA3AF] font-medium">{type}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right Side - Control Insights Panel */}
      <motion.div 
        className="w-full lg:w-96 space-y-4"
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Adjusted Concentration */}
        <motion.div 
          className="bg-gradient-to-br from-[#11161D]/90 to-[#0B0F14]/90 backdrop-blur-xl border border-[#1E2630]/50 rounded-2xl p-5 md:p-6 shadow-xl"
          whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-base md:text-lg font-bold text-[#F9FAFB] mb-4 flex items-center gap-2">
            <div className="w-1.5 h-5 md:h-6 bg-gradient-to-b from-[#06B6D4] to-[#0891B2] rounded-full" />
            Adjusted Concentration
          </h3>
          <div className="space-y-3 text-sm md:text-base">
            <div className="flex justify-between items-center">
              <span className="text-[#9CA3AF] font-medium">Top 1 (EOA only)</span>
              <span className="text-[#F9FAFB] font-bold text-base md:text-lg">18%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#9CA3AF] font-medium">Top 5 (EOA only)</span>
              <span className="text-[#F9FAFB] font-bold text-base md:text-lg">34%</span>
            </div>
            <div className="border-t border-[#1E2630] pt-3 mt-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#9CA3AF] font-medium">Raw Top 1</span>
                <span className="text-[#F9FAFB] font-bold text-base md:text-lg">28%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9CA3AF] font-medium">Raw Top 5</span>
                <span className="text-[#F9FAFB] font-bold text-base md:text-lg">72%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Supply Breakdown */}
        <motion.div 
          className="bg-gradient-to-br from-[#11161D]/90 to-[#0B0F14]/90 backdrop-blur-xl border border-[#1E2630]/50 rounded-2xl p-5 md:p-6 shadow-xl"
          whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-base md:text-lg font-bold text-[#F9FAFB] mb-4 flex items-center gap-2">
            <div className="w-1.5 h-5 md:h-6 bg-gradient-to-b from-[#3B82F6] to-[#1E40AF] rounded-full" />
            Supply Breakdown
          </h3>
          
          {/* Segmented bar */}
          <div className="h-8 md:h-10 rounded-xl overflow-hidden flex mb-4 md:mb-5 shadow-lg">
            {[
              { color: '#3B82F6', width: '28%', label: 'LP 28%' },
              { color: '#10B981', width: '36%', label: 'EOA 36%' },
              { color: '#F59E0B', width: '14%', label: 'DAO 14%' },
              { color: '#06B6D4', width: '10%', label: 'Staking 10%' },
              { color: '#8B5CF6', width: '9%', label: 'Smart Wallet 9%' },
              { color: '#6B7280', width: '3%', label: 'Burn 3%' }
            ].map((segment, index) => (
              <motion.div
                key={index}
                className="h-full relative group cursor-pointer"
                style={{ backgroundColor: segment.color, width: segment.width }}
                title={segment.label}
                initial={{ width: 0 }}
                animate={{ width: segment.width }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                whileHover={{ filter: 'brightness(1.2)' }}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              </motion.div>
            ))}
          </div>

          <div className="space-y-2 md:space-y-2.5 text-sm">
            {[
              { color: '#3B82F6', label: 'Liquidity Pools', value: '28%' },
              { color: '#10B981', label: 'EOAs', value: '36%' },
              { color: '#F59E0B', label: 'DAO', value: '14%' },
              { color: '#06B6D4', label: 'Staking', value: '10%' },
              { color: '#8B5CF6', label: 'Smart Wallet', value: '9%' },
              { color: '#6B7280', label: 'Burn', value: '3%' }
            ].map((item, index) => (
              <motion.div 
                key={item.label}
                className="flex justify-between items-center"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 1 + index * 0.05 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: item.color }} />
                  <span className="text-[#9CA3AF] font-medium">{item.label}</span>
                </div>
                <span className="text-[#F9FAFB] font-bold">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div 
          className="bg-gradient-to-br from-[#11161D]/90 to-[#0B0F14]/90 backdrop-blur-xl border border-[#1E2630]/50 rounded-2xl p-5 md:p-6 shadow-xl"
          whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-base md:text-lg font-bold text-[#F9FAFB] mb-4 flex items-center gap-2">
            <div className="w-1.5 h-5 md:h-6 bg-gradient-to-b from-[#10B981] to-[#059669] rounded-full" />
            Key Insights
          </h3>
          <ul className="space-y-2 md:space-y-2.5 text-sm">
            {[
              '28% held in Liquidity Pools',
              '14% DAO-controlled',
              '34% EOA concentration in top 5',
              '3 Smart wallets detected'
            ].map((insight, index) => (
              <motion.li 
                key={index}
                className="flex items-start gap-3 text-[#9CA3AF] font-medium"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.3 + index * 0.1 }}
              >
                <span className="text-[#06B6D4] text-lg">•</span>
                <span>{insight}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Selected Bubble Details */}
        {selectedBubble && (
          <motion.div 
            className="bg-gradient-to-br from-[#06B6D4]/10 to-[#0B0F14]/90 backdrop-blur-xl border-2 border-[#06B6D4]/50 rounded-2xl p-5 md:p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-[#F9FAFB] flex items-center gap-2">
                <div className="w-1.5 h-5 md:h-6 bg-gradient-to-b from-[#06B6D4] to-[#0891B2] rounded-full" />
                Selected Holder
              </h3>
              <button 
                onClick={() => setSelectedBubble(null)}
                className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-[#6B7280] mb-1 font-medium">Address</div>
                <div className="text-[#F9FAFB] font-mono font-semibold break-all">{selectedBubble.address}</div>
              </div>
              {selectedBubble.label && (
                <div>
                  <div className="text-[#6B7280] mb-1 font-medium">Label</div>
                  <div className="text-[#F9FAFB] font-semibold">{selectedBubble.label}</div>
                </div>
              )}
              <div>
                <div className="text-[#6B7280] mb-1 font-medium">Classification</div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-lg" 
                    style={{ backgroundColor: holderColors[selectedBubble.type] }}
                  />
                  <span className="text-[#F9FAFB] font-semibold">{selectedBubble.type}</span>
                </div>
              </div>
              <div>
                <div className="text-[#6B7280] mb-1 font-medium">Concentration Impact</div>
                <div className="text-[#F9FAFB] font-semibold">
                  {selectedBubble.percentage > 15 ? '🔴 High' : selectedBubble.percentage > 5 ? '🟡 Medium' : '🟢 Low'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}