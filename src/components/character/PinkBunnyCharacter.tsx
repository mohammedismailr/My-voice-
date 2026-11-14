import React from 'react';
import { motion } from 'framer-motion';
import type { VoiceState } from '../../types';

interface CharacterArtProps {
  state: VoiceState;
  audioLevel: number;
  isBlinking: boolean;
}

export const PinkBunnyCharacter: React.FC<CharacterArtProps> = ({
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
        {/* Soft Strawberry Pink Plush Gradient */}
        <radialGradient id="bunny-grad" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FCE7F3" />
          <stop offset="55%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#DB2777" />
        </radialGradient>

        {/* Inner Ear Peach/Cream Felt Gradient */}
        <linearGradient id="inner-ear" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE4E6" />
          <stop offset="100%" stopColor="#FDA4AF" />
        </linearGradient>

        {/* Pastel Mint Headphone Cup */}
        <radialGradient id="mint-cup" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#99F6E4" />
          <stop offset="70%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#0F766E" />
        </radialGradient>
      </defs>

      {/* Bunny Ears (Perk up when listening) */}
      {/* Left Ear */}
      <motion.g
        animate={
          isListening
            ? { rotate: [-10, -18, -10], y: -8 }
            : isSpeaking
            ? { rotate: [-12, -7, -12], y: [0, -4, 0] }
            : { rotate: -10 }
        }
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '85px', originY: '95px' }}
      >
        <path
          d="M 85 95 C 65 60, 50 15, 75 10 C 95 6, 105 45, 95 95 Z"
          fill="url(#bunny-grad)"
          filter="drop-shadow(0 6px 8px rgba(0,0,0,0.18))"
        />
        {/* Inner Ear Felt */}
        <path d="M 83 85 C 72 58, 62 25, 76 20 C 88 18, 94 48, 89 85 Z" fill="url(#inner-ear)" />
        {/* Stitches */}
        <path
          d="M 85 95 C 65 60, 50 15, 75 10 C 95 6, 105 45, 95 95 Z"
          stroke="rgba(190, 24, 93, 0.28)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          fill="none"
        />
      </motion.g>

      {/* Right Ear */}
      <motion.g
        animate={
          isListening
            ? { rotate: [10, 18, 10], y: -8 }
            : isSpeaking
            ? { rotate: [12, 7, 12], y: [0, -4, 0] }
            : { rotate: 10 }
        }
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '155px', originY: '95px' }}
      >
        <path
          d="M 155 95 C 175 60, 190 15, 165 10 C 145 6, 135 45, 145 95 Z"
          fill="url(#bunny-grad)"
          filter="drop-shadow(0 6px 8px rgba(0,0,0,0.18))"
        />
        {/* Inner Ear Felt */}
        <path d="M 157 85 C 168 58, 178 25, 164 20 C 152 18, 146 48, 151 85 Z" fill="url(#inner-ear)" />
        {/* Stitches */}
        <path
          d="M 155 95 C 175 60, 190 15, 165 10 C 145 6, 135 45, 145 95 Z"
          stroke="rgba(190, 24, 93, 0.28)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          fill="none"
        />
      </motion.g>

      {/* Headphone Arch */}
      <path
        d="M 46 130 C 44 65, 196 65, 194 130"
        stroke="#1E293B"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bunny Round Plush Head */}
      <circle
        cx="120"
        cy="142"
        r="68"
        fill="url(#bunny-grad)"
        filter="drop-shadow(0 14px 20px rgba(219,39,119,0.3))"
      />

      {/* Head Perimeter Stitches */}
      <circle
        cx="120"
        cy="142"
        r="62"
        stroke="rgba(157, 23, 77, 0.3)"
        strokeWidth="1.8"
        strokeDasharray="4 3"
        fill="none"
      />

      {/* Rosy Cheeks */}
      <ellipse cx="80" cy="154" rx="12" ry="7" fill="#FB7185" opacity="0.5" />
      <ellipse cx="160" cy="154" rx="12" ry="7" fill="#FB7185" opacity="0.5" />

      {/* Expressive Bunny Eyes */}
      {isBlinking ? (
        <g stroke="#4C0519" strokeWidth="3" strokeLinecap="round">
          <line x1="88" y1="138" x2="102" y2="138" />
          <line x1="138" y1="138" x2="152" y2="138" />
        </g>
      ) : isError ? (
        <g stroke="#4C0519" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 86 140 Q 95 134 104 140" />
          <path d="M 136 140 Q 145 134 154 140" />
          <text x="175" y="95" fill="#F43F5E" fontSize="18" fontWeight="bold">?</text>
        </g>
      ) : isThinking ? (
        <g fill="#4C0519">
          <circle cx="95" cy="134" r="7" />
          <circle cx="145" cy="134" r="7" />
          <circle cx="97" cy="132" r="2.8" fill="#FFFFFF" />
          <circle cx="147" cy="132" r="2.8" fill="#FFFFFF" />
        </g>
      ) : (
        <g fill="#4C0519">
          <circle cx="95" cy="138" r="7.5" />
          <circle cx="145" cy="138" r="7.5" />
          <circle cx="93" cy="135" r="3" fill="#FFFFFF" />
          <circle cx="97" cy="140" r="1.3" fill="#FFFFFF" />
          <circle cx="143" cy="135" r="3" fill="#FFFFFF" />
          <circle cx="147" cy="140" r="1.3" fill="#FFFFFF" />
        </g>
      )}

      {/* Tiny Heart Nose */}
      <path
        d="M 120 148 C 117 144, 114 146, 115 149 C 116 152, 120 155, 120 156 C 120 155, 124 152, 125 149 C 126 146, 123 144, 120 148 Z"
        fill="#BE185D"
      />

      {/* Mouth */}
      <motion.g
        animate={{
          scaleY: mouthOpenY,
          originY: '158px',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {isSpeaking ? (
          <path
            d="M 112 158 Q 120 172 128 158 Z"
            fill="#E11D48"
            stroke="#4C0519"
            strokeWidth="2"
          />
        ) : (
          <path
            d="M 112 158 Q 116 163 120 159 Q 124 163 128 158"
            stroke="#4C0519"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </motion.g>

      {/* Mint Headphones Earcup Left */}
      <g filter="drop-shadow(-2px 4px 6px rgba(0,0,0,0.25))">
        <rect x="36" y="120" width="20" height="44" rx="10" fill="url(#mint-cup)" stroke="#115E59" strokeWidth="1.5" />
        <motion.circle
          cx="46"
          cy="142"
          r="3.5"
          fill="#FFFFFF"
          animate={isListening ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </g>

      {/* Mint Headphones Earcup Right */}
      <g filter="drop-shadow(2px 4px 6px rgba(0,0,0,0.25))">
        <rect x="184" y="120" width="20" height="44" rx="10" fill="url(#mint-cup)" stroke="#115E59" strokeWidth="1.5" />
        <motion.circle
          cx="194"
          cy="142"
          r="3.5"
          fill="#FFFFFF"
          animate={isListening ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </g>
    </svg>
  );
};
