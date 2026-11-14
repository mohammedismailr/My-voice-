import React from 'react';
import { motion } from 'framer-motion';
import type { VoiceState } from '../../types';

interface CharacterArtProps {
  state: VoiceState;
  audioLevel: number;
  isBlinking: boolean;
}

export const PurpleHeartCharacter: React.FC<CharacterArtProps> = ({
  state,
  audioLevel,
  isBlinking,
}) => {
  const isListening = state === 'listening' || state === 'speech_detected';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'processing' || state === 'generating';
  const isError = state === 'error';

  const mouthOpenY = isSpeaking ? Math.max(0.4, audioLevel * 1.6) : isListening ? 0.3 : 0.1;

  return (
    <svg viewBox="0 0 240 240" className="w-full h-full select-none" fill="none">
      <defs>
        {/* Deep Velvet Purple Radial Gradient */}
        <radialGradient id="heart-grad" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="45%" stopColor="#A855F7" />
          <stop offset="85%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#581C87" />
        </radialGradient>

        {/* Heart Sunglasses Gradient */}
        <linearGradient id="heart-lens" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#9F1239" />
        </linearGradient>

        {/* Sunglasses Glass Glint */}
        <linearGradient id="glasses-glint" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Plush Heart Body */}
      <path
        d="M 120 72
           C 105 40, 52 40, 42 88
           C 32 135, 78 175, 120 208
           C 162 175, 208 135, 198 88
           C 188 40, 135 40, 120 72 Z"
        fill="url(#heart-grad)"
        filter="drop-shadow(0 14px 20px rgba(126,34,206,0.35))"
      />

      {/* Stitched Seams Along Cleft and Perimeter */}
      <path
        d="M 120 78
           C 108 48, 60 48, 50 90
           C 42 130, 84 168, 120 198
           C 156 168, 198 130, 190 90
           C 180 48, 132 48, 120 78 Z"
        stroke="rgba(88, 28, 135, 0.35)"
        strokeWidth="1.8"
        strokeDasharray="4 3"
        fill="none"
      />

      {/* Center Seam of Plush Heart */}
      <path
        d="M 120 74 L 120 198"
        stroke="rgba(88, 28, 135, 0.25)"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        fill="none"
      />

      {/* Cheeks */}
      <ellipse cx="68" cy="148" rx="10" ry="6" fill="#F472B6" opacity="0.45" />
      <ellipse cx="172" cy="148" rx="10" ry="6" fill="#F472B6" opacity="0.45" />

      {/* Eyes Peek over Sunglasses or Behind Them */}
      {isBlinking ? (
        <g stroke="#2E1065" strokeWidth="3" strokeLinecap="round">
          <line x1="82" y1="112" x2="96" y2="112" />
          <line x1="144" y1="112" x2="158" y2="112" />
        </g>
      ) : isError ? (
        <g stroke="#2E1065" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 80 114 Q 89 108 98 114" />
          <path d="M 142 114 Q 151 108 160 114" />
          <text x="180" y="75" fill="#E11D48" fontSize="18" fontWeight="bold">?</text>
        </g>
      ) : null}

      {/* Funky Heart-Shaped Sunglasses */}
      <motion.g
        animate={
          isThinking
            ? { rotate: [-2, 4, -2], y: [0, 3, 0] }
            : isListening
            ? { y: -2, scale: 1.03 }
            : { rotate: 0, y: 0 }
        }
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        filter="drop-shadow(0 6px 8px rgba(0,0,0,0.3))"
      >
        {/* Bridge */}
        <rect x="112" y="118" width="16" height="4" rx="2" fill="#18181B" />

        {/* Left Heart Lens Frame */}
        <path
          d="M 88 108
             C 80 94, 58 94, 52 112
             C 46 130, 70 144, 88 156
             C 106 144, 130 130, 124 112
             C 118 94, 96 94, 88 108 Z"
          fill="url(#heart-lens)"
          stroke="#18181B"
          strokeWidth="3.5"
          transform="scale(0.85) translate(15, 20)"
        />
        {/* Left Lens Glint */}
        <path
          d="M 84 105 C 78 98, 64 98, 60 110"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />

        {/* Right Heart Lens Frame */}
        <path
          d="M 152 108
             C 144 94, 122 94, 116 112
             C 110 130, 134 144, 152 156
             C 170 144, 194 130, 188 112
             C 182 94, 160 94, 152 108 Z"
          fill="url(#heart-lens)"
          stroke="#18181B"
          strokeWidth="3.5"
          transform="scale(0.85) translate(30, 20)"
        />
        {/* Right Lens Glint */}
        <path
          d="M 148 105 C 142 98, 128 98, 124 110"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
      </motion.g>

      {/* Mouth */}
      <motion.g
        animate={{
          scaleY: mouthOpenY,
          originY: '162px',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {isSpeaking ? (
          <path
            d="M 111 162 Q 120 178 129 162 Z"
            fill="#BE123C"
            stroke="#2E1065"
            strokeWidth="2"
          />
        ) : (
          <path
            d="M 112 161 Q 120 169 128 161"
            stroke="#2E1065"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </motion.g>
    </svg>
  );
};
