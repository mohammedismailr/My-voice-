import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VoiceState } from '../../types';
import type { CharacterId } from '../../types/character';
import { CHARACTERS } from '../../data/characters';
import { PlushMeshDefs } from './PlushMesh';
import { ThreePlushScene } from './ThreePlushScene';
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
  forceSvg?: boolean;
}

const checkWebGLSupport = (): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
};

export const PlushCharacter: React.FC<PlushCharacterProps> = ({
  characterId,
  state,
  audioLevel = 0,
  onCharacterClick,
  size = 'lg',
  interactive = true,
  forceSvg = false,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [hasWebGL] = useState(() => checkWebGLSupport());
  const character = CHARACTERS[characterId] || CHARACTERS['beige-mascot'];

  // Randomized blinking scheduler
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
    lg: 'w-56 h-56 md:w-68 md:h-68 lg:w-80 lg:h-80',
    xl: 'w-72 h-72 md:w-84 md:h-84 lg:w-96 lg:h-96',
  }[size];

  const isListening = state === 'listening' || state === 'speech_detected';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'processing' || state === 'generating';

  // SVG Fallback renderer
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

      {/* Ambient Floor Shadow (reacts to height & speech) */}
      <motion.div
        animate={
          isSpeaking
            ? { scale: [0.85, 0.95, 0.85], opacity: [0.25, 0.45, 0.25] }
            : isListening
            ? { scale: 1.08, opacity: 0.42 }
            : { scale: [0.9, 1, 0.9], opacity: [0.22, 0.35, 0.22] }
        }
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-4 w-3/5 h-6 rounded-full bg-black/40 blur-md pointer-events-none"
      />

      {/* Concentric Aura Waveforms when Listening */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              initial={{ scale: 0.85, opacity: 0.7 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `3px solid ${character.colors.primary}`,
                boxShadow: `0 0 45px ${character.colors.glow}`,
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1.75, opacity: 0 }}
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
                  scale: [0.5, 1.3, 0.4],
                  x: [0, (i - 1) * 40],
                  y: [0, -35 - i * 18],
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

      {/* Main 3D Interactive Container */}
      <div className={`relative ${sizeClasses} z-10 flex items-center justify-center`}>
        {!forceSvg && size !== 'sm' && hasWebGL ? (
          <ThreePlushScene
            characterId={characterId}
            state={state}
            audioLevel={audioLevel}
            onCharacterClick={onCharacterClick}
            interactive={interactive}
          />
        ) : (
          <motion.div
            whileHover={interactive ? { scale: 1.05 } : {}}
            whileTap={interactive ? { scale: 0.95 } : {}}
            onClick={interactive ? onCharacterClick : undefined}
            className="w-full h-full cursor-pointer"
          >
            {renderCharacterSVG()}
          </motion.div>
        )}
      </div>
    </div>
  );
};
