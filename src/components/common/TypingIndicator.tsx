import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  label?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  label = 'MyVoice is thinking...',
}) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#171B2B]/90 border border-purple-500/20 px-4 py-3 shadow-lg max-w-fit">
      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
        <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <div className="flex items-center gap-1.5 ml-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{
              y: [0, -5, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
            className="h-1.5 w-1.5 rounded-full bg-cyan-400"
          />
        ))}
      </div>
    </div>
  );
};
