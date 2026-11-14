import React from 'react';
import { motion } from 'framer-motion';

interface VoiceVisualizerProps {
  frequencies: number[];
  isActive: boolean;
  color?: string;
  glowColor?: string;
  mode?: 'mic' | 'speaker' | 'idle';
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  frequencies,
  isActive,
  color = '#8B5CF6',
  glowColor = 'rgba(139, 92, 246, 0.4)',
  mode = 'idle',
}) => {
  return (
    <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
      <div className="flex items-center gap-1 h-8">
        {frequencies.map((val, idx) => {
          const heightPx = isActive ? Math.max(6, Math.min(30, val * 30)) : 6;

          return (
            <motion.div
              key={idx}
              animate={{ height: `${heightPx}px` }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="w-1.5 rounded-full transition-colors"
              style={{
                backgroundColor: isActive ? color : 'rgba(255, 255, 255, 0.2)',
                boxShadow: isActive ? `0 0 10px ${glowColor}` : 'none',
              }}
            />
          );
        })}
      </div>
      {isActive && (
        <span className="text-[10px] font-semibold tracking-wider uppercase ml-1.5 text-slate-400">
          {mode === 'mic' ? 'Live Mic' : mode === 'speaker' ? 'Audio Out' : 'Ready'}
        </span>
      )}
    </div>
  );
};
