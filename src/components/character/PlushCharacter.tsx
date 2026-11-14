import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VoiceState } from '../../types';
import type { CharacterId } from '../../types/character';
import { CHARACTERS } from '../../data/characters';
import { PlushMeshDefs } from './PlushMesh';
import { BeigeHoodedMascot } from './BeigeHoodedMascot';
import { YellowTriangleCharacter } from './YellowTriangleCharacter';
import { BlueCloudCharacter } from './BlueCloudCharacter';
import { PinkBunnyCharacter } from './PinkBunnyCharacter';
import { PurpleHeartCharacter } from './PurpleHeartCharacter';

interface PlushCharacterProps {
  characterId: CharacterId;
  state: VoiceState;
  audioLevel?: number;
  onCharacterClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
}

export const PlushCharacter: React.FC<PlushCharacterProps> = ({
  characterId,
  state,
  audioLevel = 0,
  onCharacterClick,
  size = 'lg',
  interactive = true,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const character = CHARACTERS[characterId] || CHARACTERS['beige-mascot'];

  // Realistic natural blinking cycle with randomized timing
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    let blinkInterval: ReturnType<typeof setInterval>;

    const triggerBlink = () => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);
      }, 160);
    };

    const scheduleNextBlink = () => {
      const delay = 2500 + Math.random() * 3000;
      blinkInterval = setTimeout(() => {
        triggerBlink();
        scheduleNextBlink();
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(blinkInterval);
    };
  }, []);

  const sizeClasses = {
    sm: 'w-24 h-24 md:w-28 md:h-28',
    md: 'w-36 h-36 md:w-44 md:h-44',
    lg: 'w-56 h-56 md:w-68 md:h-68 lg:w-76 lg:h-76',
    xl: 'w-72 h-72 md:w-84 md:h-84 lg:w-96 lg:h-96',
  }[size];

  const isListening = state === 'listening' || state === 'speech_detected';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'processing' || state === 'generating';
  const isError = state === 'error';

  // Character-specific component resolver
  const renderCharacterSVG = () => {
    switch (characterId) {
      case 'yellow-triangle':
        return <YellowTriangleCharacter state={state} audioLevel={audioLevel} isBlinking={isBlinking} />;
      case 'blue-cloud':
        return <BlueCloudCharacter state={state} audioLevel={audioLevel} isBlinking={isBlinking} />;
      case 'pink-bunny':
        return <PinkBunnyCharacter state={state} audioLevel={audioLevel} isBlinking={isBlinking} />;
      case 'purple-heart':
        return <PurpleHeartCharacter state={state} audioLevel={audioLevel} isBlinking={isBlinking} />;
      case 'beige-mascot':
      default:
        return <BeigeHoodedMascot state={state} audioLevel={audioLevel} isBlinking={isBlinking} />;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <PlushMeshDefs />

      {/* Ambient Floor Shadow (Reacts to height) */}
      <motion.div
        animate={
          isSpeaking
            ? { scale: [0.85, 0.95, 0.85], opacity: [0.25, 0.4, 0.25] }
            : isListening
            ? { scale: 1.05, opacity: 0.4 }
            : { scale: [0.9, 1, 0.9], opacity: [0.25, 0.35, 0.25] }
        }
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-4 w-3/5 h-6 rounded-full bg-black/35 blur-md pointer-events-none"
      />

      {/* Concentric Aura Waveforms when Listening */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              initial={{ scale: 0.85, opacity: 0.7 }}
              animate={{ scale: 1.45, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `3px solid ${character.colors.primary}`,
                boxShadow: `0 0 40px ${character.colors.glow}`,
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1.7, opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `2px solid ${character.colors.secondary}`,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Floating Sparkles when Thinking */}
      <AnimatePresence>
        {isThinking && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.4],
                  x: [0, (i - 1) * 35],
                  y: [0, -35 - i * 15],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut',
                }}
                className="absolute top-1/4 left-1/2 w-4 h-4 text-cyan-300 font-bold text-xs"
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Main Plush Body Container */}
      <motion.div
        whileHover={interactive ? { scale: 1.04 } : {}}
        whileTap={interactive ? { scale: 0.96 } : {}}
        onClick={interactive ? onCharacterClick : undefined}
        className={`relative ${sizeClasses} cursor-pointer focus:outline-none transition-shadow z-10`}
      >
        {/* Character Motion Rig */}
        <motion.div
          className="w-full h-full"
          animate={
            isSpeaking
              ? {
                  y: [0, -12, 0],
                  scaleY: [1, 1.07, 0.95, 1],
                  scaleX: [1, 0.95, 1.04, 1],
                }
              : isThinking
              ? {
                  rotate: [0, -5, 5, -3, 0],
                  y: [0, -4, 0],
                }
              : isListening
              ? {
                  y: -6,
                  scale: 1.04,
                }
              : isError
              ? {
                  rotate: [0, -4, 0],
                  y: 4,
                }
              : {
                  // Idle: natural breathing & floating
                  y: [0, -8, 0],
                  scale: [1, 1.025, 1],
                }
          }
          transition={
            isSpeaking
              ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
              : isThinking
              ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              : isListening
              ? { duration: 0.4 }
              : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {renderCharacterSVG()}
        </motion.div>
      </motion.div>
    </div>
  );
};
