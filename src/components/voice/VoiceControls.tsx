import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, RotateCcw, VolumeX, Sparkles, AlertCircle, X } from 'lucide-react';
import type { VoiceState } from '../../types';
import type { CharacterConfig } from '../../types/character';
import { VoiceVisualizer } from './VoiceVisualizer';

interface VoiceControlsProps {
  voiceState: VoiceState;
  isListening: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onCancelListening: () => void;
  onStopSpeaking: () => void;
  onReplay: () => void;
  hasLastSpoken: boolean;
  errorMessage?: string | null;
  activeCharacter?: CharacterConfig;
  frequencies?: number[];
  size?: 'normal' | 'large';
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  voiceState,
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onCancelListening,
  onStopSpeaking,
  onReplay,
  hasLastSpoken,
  errorMessage,
  activeCharacter,
  frequencies = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
  size = 'normal',
}) => {
  const primaryColor = activeCharacter?.colors.primary || '#8B5CF6';
  const glowColor = activeCharacter?.colors.glow || 'rgba(139, 92, 246, 0.45)';

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto select-none">
      {/* Live Voice Status Badge & Audio Wave Visualizer */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {isListening && (
          <VoiceVisualizer
            frequencies={frequencies}
            isActive={true}
            color={primaryColor}
            glowColor={glowColor}
            mode="mic"
          />
        )}

        {isSpeaking && (
          <VoiceVisualizer
            frequencies={frequencies}
            isActive={true}
            color="#EC4899"
            glowColor="rgba(236, 72, 153, 0.45)"
            mode="speaker"
          />
        )}

        {(voiceState === 'processing' || voiceState === 'generating') && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 px-3.5 py-1 text-xs font-semibold text-purple-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 animate-spin text-purple-400" />
            Thinking of a response...
          </span>
        )}

        {voiceState === 'error' && errorMessage && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-3.5 py-1 text-xs font-semibold text-red-300 backdrop-blur-md">
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            {errorMessage}
          </span>
        )}
      </div>

      {/* Main Tactile Action Controls Bar */}
      <div className="flex items-center gap-2.5 rounded-3xl border border-white/10 bg-[#171B2B]/90 p-2 shadow-2xl backdrop-blur-2xl">
        {isListening ? (
          <>
            {/* Done Speaking Button */}
            <motion.button
              type="button"
              onClick={onStopListening}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              title="Finish speaking and send"
              className="flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold text-slate-950 shadow-lg cursor-pointer transition-all"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 0 20px ${glowColor}`,
              }}
            >
              <Square className="h-4 w-4 fill-current" />
              <span>Done Speaking</span>
            </motion.button>

            {/* Cancel Voice Input */}
            <motion.button
              type="button"
              onClick={onCancelListening}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              title="Cancel voice input"
              className="flex items-center gap-1.5 rounded-2xl border border-white/10 px-3.5 py-3 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </motion.button>
          </>
        ) : (
          /* Big Tactile Start Voice Button */
          <motion.button
            type="button"
            onClick={onStartListening}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96, y: 1 }}
            title="Start voice conversation"
            className={`flex items-center justify-center gap-2.5 rounded-2xl font-bold text-white shadow-xl cursor-pointer transition-all ${
              size === 'large' ? 'px-7 py-3.5 text-sm' : 'px-5 py-2.5 text-xs'
            }`}
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #6366F1)`,
              boxShadow: `0 8px 24px -4px ${glowColor}`,
            }}
          >
            <Mic className={size === 'large' ? 'h-5 w-5' : 'h-4 w-4'} />
            <span>Talk to {activeCharacter?.name || 'Companion'}</span>
          </motion.button>
        )}

        {/* TTS Stop Speaking Button */}
        {isSpeaking && (
          <motion.button
            type="button"
            onClick={onStopSpeaking}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Stop AI speech"
            className="flex items-center gap-1.5 rounded-2xl border border-red-500/30 bg-red-500/15 px-3.5 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-500/25 transition-all"
          >
            <VolumeX className="h-4 w-4" />
            <span>Mute</span>
          </motion.button>
        )}

        {/* Replay Button */}
        {!isSpeaking && hasLastSpoken && (
          <motion.button
            type="button"
            onClick={onReplay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Replay last spoken response"
            className="flex items-center gap-1.5 rounded-2xl border border-white/10 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Replay</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};
