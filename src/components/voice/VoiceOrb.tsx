import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import type { VoiceState } from '../../types';

interface VoiceOrbProps {
  state: VoiceState;
  onOrbClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  onOrbClick,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
  }[size];

  // Visual cues based on voice state
  const isListening = state === 'listening' || state === 'speech_detected';
  const isSpeaking = state === 'speaking';
  const isProcessing = state === 'processing' || state === 'generating';
  const isError = state === 'error';

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Outer Glow & Animated Ripple Rings when Listening */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              className={`absolute rounded-full border-2 border-cyan-400/50 ${sizeClasses}`}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
              className={`absolute rounded-full border border-purple-400/40 ${sizeClasses}`}
            />
          </>
        )}
      </AnimatePresence>

      {/* Speaking Pulse Ring */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute rounded-full border border-purple-500/40 bg-purple-500/10 ${sizeClasses}`}
          />
        )}
      </AnimatePresence>

      {/* Main Interactive Orb Body */}
      <motion.button
        type="button"
        onClick={onOrbClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center justify-center rounded-full cursor-pointer shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/30 ${sizeClasses}`}
      >
        {/* Core Gradient Sphere */}
        <motion.div
          animate={
            isProcessing
              ? { rotate: 360 }
              : isListening
              ? { scale: [1, 1.06, 1] }
              : isSpeaking
              ? { scale: [1, 1.08, 1] }
              : { scale: [1, 1.03, 1] }
          }
          transition={
            isProcessing
              ? { duration: 3, repeat: Infinity, ease: 'linear' }
              : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
          }
          className={`absolute inset-0 rounded-full ${
            isError
              ? 'bg-gradient-to-br from-red-500 to-rose-700 shadow-[0_0_40px_rgba(244,63,94,0.4)]'
              : isListening
              ? 'bg-gradient-to-br from-cyan-400 via-sky-500 to-purple-600 shadow-[0_0_50px_rgba(34,211,238,0.5)]'
              : isSpeaking
              ? 'bg-gradient-to-br from-purple-500 via-indigo-600 to-cyan-400 shadow-[0_0_50px_rgba(139,92,246,0.5)]'
              : isProcessing
              ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 shadow-[0_0_45px_rgba(168,85,247,0.45)]'
              : 'bg-gradient-to-br from-purple-600/80 via-slate-800 to-cyan-600/80 shadow-[0_0_35px_rgba(139,92,246,0.3)]'
          }`}
        >
          {/* Internal Shimmer / Glass reflection */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-t from-black/40 via-transparent to-white/20 backdrop-blur-sm" />
        </motion.div>

        {/* Center Icon according to Voice State */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white drop-shadow-md">
          {isListening && (
            <div className="flex flex-col items-center">
              <Mic className="h-8 w-8 text-white animate-pulse" />
              <div className="mt-1 flex items-center gap-1">
                {[0, 1, 2, 3].map((bar) => (
                  <motion.span
                    key={bar}
                    animate={{ height: ['8px', '20px', '8px'] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: bar * 0.12,
                      ease: 'easeInOut',
                    }}
                    className="w-1 rounded-full bg-white/90"
                  />
                ))}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center">
              <Sparkles className="h-8 w-8 text-white animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          )}

          {isSpeaking && (
            <div className="flex flex-col items-center">
              <Volume2 className="h-8 w-8 text-white animate-pulse" />
              <div className="mt-1 flex items-center gap-1">
                {[0, 1, 2, 3].map((bar) => (
                  <motion.span
                    key={bar}
                    animate={{ height: ['6px', '18px', '6px'] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: bar * 0.1,
                      ease: 'easeInOut',
                    }}
                    className="w-1 rounded-full bg-cyan-200"
                  />
                ))}
              </div>
            </div>
          )}

          {isError && <AlertCircle className="h-8 w-8 text-white" />}

          {state === 'idle' && (
            <div className="flex flex-col items-center">
              <Mic className="h-8 w-8 text-white/90 group-hover:scale-110 transition-transform" />
              <span className="mt-1 text-[10px] font-medium tracking-wider uppercase text-white/70">
                Tap to talk
              </span>
            </div>
          )}
        </div>
      </motion.button>
    </div>
  );
};
