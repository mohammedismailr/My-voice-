import React from 'react';
import { motion } from 'framer-motion';
import type { VoiceState } from '../../types';

interface CharacterArtProps {
  state: VoiceState;
  audioLevel: number;
  isBlinking: boolean;
}

export const BlueCloudCharacter: React.FC<CharacterArtProps> = ({
  state,
  audioLevel,
  isBlinking,
}) => {
  const isListening = state === 'listening' || state === 'speech_detected';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'processing' || state === 'generating';
  const isError = state === 'error';

  const mouthOpenY = isSpeaking ? Math.max(0.4, audioLevel * 1.5) : isListening ? 0.3 : 0.1;

  return (
    <svg viewBox="0 0 240 240" className="w-full h-full select-none" fill="none">
      <defs>
        {/* Soft Dreamy Cloud Gradient */}
        <radialGradient id="cloud-grad" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#BAE6FD" />
          <stop offset="85%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#38BDF8" />
        </radialGradient>

        {/* Beret Felt Gradient */}
        <radialGradient id="beret-grad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="70%" stopColor="#18181B" />
          <stop offset="100%" stopColor="#09090B" />
        </radialGradient>
      </defs>

      {/* Cloud Shadow */}
      <ellipse cx="120" cy="208" rx="65" ry="12" fill="rgba(0,0,0,0.15)" filter="blur(6px)" />

      {/* Cloud Puffy Body (Multi-lobe smooth cloud) */}
      <path
        d="M 72 170
           C 42 170, 32 140, 48 118
           C 36 94, 60 68, 86 76
           C 100 52, 140 50, 156 74
           C 182 66, 206 90, 194 116
           C 212 138, 198 170, 168 170
           Z"
        fill="url(#cloud-grad)"
        filter="drop-shadow(0 14px 20px rgba(14,165,233,0.25))"
      />

      {/* Cloud Felt Perimeter Stitches */}
      <path
        d="M 74 164
           C 48 164, 40 138, 54 120
           C 44 98, 64 76, 88 82
           C 102 60, 138 58, 152 80
           C 176 74, 198 94, 188 118
           C 204 136, 192 164, 166 164
           Z"
        stroke="rgba(3, 105, 161, 0.28)"
        strokeWidth="1.8"
        strokeDasharray="4 3"
        fill="none"
      />

      {/* Soft Rosy Cheeks */}
      <ellipse cx="84" cy="132" rx="10" ry="6" fill="#F472B6" opacity="0.45" />
      <ellipse cx="156" cy="132" rx="10" ry="6" fill="#F472B6" opacity="0.45" />

      {/* Dreamy Expressive Eyes */}
      {isBlinking ? (
        <g stroke="#0F172A" strokeWidth="3" strokeLinecap="round">
          <line x1="94" y1="116" x2="108" y2="116" />
          <line x1="132" y1="116" x2="146" y2="116" />
        </g>
      ) : isError ? (
        <g stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 92 118 Q 101 112 110 118" />
          <path d="M 130 118 Q 139 112 148 118" />
          <text x="175" y="85" fill="#38BDF8" fontSize="18" fontWeight="bold">?</text>
        </g>
      ) : isThinking ? (
        <g fill="#0F172A">
          <circle cx="101" cy="112" r="6.5" />
          <circle cx="139" cy="112" r="6.5" />
          <circle cx="103" cy="110" r="2.5" fill="#FFFFFF" />
          <circle cx="141" cy="110" r="2.5" fill="#FFFFFF" />
        </g>
      ) : (
        <g fill="#0F172A">
          <circle cx="101" cy="116" r="7" />
          <circle cx="139" cy="116" r="7" />
          <circle cx="99" cy="113" r="2.8" fill="#FFFFFF" />
          <circle cx="103" cy="118" r="1.2" fill="#FFFFFF" />
          <circle cx="137" cy="113" r="2.8" fill="#FFFFFF" />
          <circle cx="141" cy="118" r="1.2" fill="#FFFFFF" />
        </g>
      )}

      {/* Mouth */}
      <motion.g
        animate={{
          scaleY: mouthOpenY,
          originY: '136px',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {isSpeaking ? (
          <path
            d="M 112 136 Q 120 150 128 136 Z"
            fill="#E11D48"
            stroke="#0F172A"
            strokeWidth="2"
          />
        ) : (
          <path
            d="M 113 134 Q 120 141 127 134"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </motion.g>

      {/* Chic Black Parisian Beret (Tilted to one side) */}
      <g filter="drop-shadow(0 6px 8px rgba(0,0,0,0.3))">
        {/* Main Beret Disc */}
        <ellipse
          cx="142"
          cy="62"
          rx="38"
          ry="18"
          transform="rotate(-15, 142, 62)"
          fill="url(#beret-grad)"
          stroke="#52525B"
          strokeWidth="1.2"
        />
        {/* Beret Crown Fold */}
        <path
          d="M 112 56 C 130 46, 160 50, 174 65"
          stroke="#71717A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Beret Little Stalk / Stem on top */}
        <path
          d="M 142 45 Q 143 38 147 36"
          stroke="#18181B"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
};
