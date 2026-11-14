import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import type { VoiceState } from '../../types';
import type { CharacterId } from '../../types/character';
import { PlushCharacter } from '../character/PlushCharacter';

interface VoiceOrbProps {
  state: VoiceState;
  onOrbClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  characterId?: CharacterId;
  audioLevel?: number;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  onOrbClick,
  size = 'md',
  characterId = 'beige-mascot',
  audioLevel = 0,
}) => {
  const isListening = state === 'listening' || state === 'speech_detected';
  const isSpeaking = state === 'speaking';
  const isProcessing = state === 'processing' || state === 'generating';
  const isError = state === 'error';

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* 3D Plush Character */}
      <PlushCharacter
        characterId={characterId}
        state={state}
        audioLevel={audioLevel}
        onCharacterClick={onOrbClick}
        size={size}
        interactive={true}
      />

      {/* Floating State / Action Pill */}
      <motion.button
        type="button"
        onClick={onOrbClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#171B2B]/90 px-3.5 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md cursor-pointer transition-colors hover:border-purple-500/40"
      >
        {isListening ? (
          <>
            <Mic className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-semibold">Listening...</span>
          </>
        ) : isProcessing ? (
          <>
            <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-spin" />
            <span className="text-purple-300 font-semibold">Thinking...</span>
          </>
        ) : isSpeaking ? (
          <>
            <Volume2 className="h-3.5 w-3.5 text-pink-400 animate-pulse" />
            <span className="text-pink-300 font-semibold">Speaking...</span>
          </>
        ) : isError ? (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-red-300 font-semibold">Voice Error</span>
          </>
        ) : (
          <>
            <Mic className="h-3.5 w-3.5 text-purple-300" />
            <span className="text-slate-200">Tap to talk</span>
          </>
        )}
      </motion.button>
    </div>
  );
};
