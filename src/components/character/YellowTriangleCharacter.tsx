import React from 'react';
import { motion } from 'framer-motion';
import type { VoiceState } from '../../types';

interface CharacterArtProps {
  state: VoiceState;
  audioLevel: number;
  isBlinking: boolean;
}

export const YellowTriangleCharacter: React.FC<CharacterArtProps> = ({
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
        {/* Soft Golden Prism Radial Gradient */}
        <radialGradient id="triangle-grad" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        {/* Glasses Lens Glint */}
        <linearGradient id="lens-glint" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
        </linearGradient>

        {/* Bow Tie Gradient */}
        <linearGradient id="bowtie-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
      </defs>

      {/* Rounded Triangular Plush Body */}
      {/* Path uses smooth cubic beziers around the 3 vertices */}
      <path
        d="M 120 38 
           C 134 38, 142 50, 148 62 
           L 204 165 
           C 212 180, 202 202, 185 202 
           L 55 202 
           C 38 202, 28 180, 36 165 
           L 92 62 
           C 98 50, 106 38, 120 38 Z"
        fill="url(#triangle-grad)"
        filter="drop-shadow(0 14px 18px rgba(0,0,0,0.25))"
      />

      {/* Perimeter Plush Stitches */}
      <path
        d="M 120 46 
           C 131 46, 137 55, 142 66 
           L 194 162 
           C 200 174, 192 192, 178 192 
           L 62 192 
           C 48 192, 40 174, 46 162 
           L 98 66 
           C 103 55, 109 46, 120 46 Z"
        stroke="rgba(180, 83, 9, 0.35)"
        strokeWidth="1.8"
        strokeDasharray="4 3"
        fill="none"
      />

      {/* Rosy/Orange Cheeks */}
      <ellipse cx="76" cy="150" rx="10" ry="6" fill="#F97316" opacity="0.4" />
      <ellipse cx="164" cy="150" rx="10" ry="6" fill="#F97316" opacity="0.4" />

      {/* Eyes Behind Glasses */}
      {isBlinking ? (
        <g stroke="#1F2937" strokeWidth="3" strokeLinecap="round">
          <line x1="88" y1="130" x2="102" y2="130" />
          <line x1="138" y1="130" x2="152" y2="130" />
        </g>
      ) : isError ? (
        <g stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 86 132 Q 95 125 104 132" />
          <path d="M 136 132 Q 145 125 154 132" />
          <text x="175" y="80" fill="#EF4444" fontSize="18" fontWeight="bold">!</text>
        </g>
      ) : isThinking ? (
        <g fill="#1F2937">
          <circle cx="95" cy="125" r="7" />
          <circle cx="145" cy="125" r="7" />
          <circle cx="97" cy="123" r="2.8" fill="#FFFFFF" />
          <circle cx="147" cy="123" r="2.8" fill="#FFFFFF" />
        </g>
      ) : (
        <g fill="#1F2937">
          <circle cx="95" cy="130" r="7.5" />
          <circle cx="145" cy="130" r="7.5" />
          <circle cx="93" cy="127" r="3" fill="#FFFFFF" />
          <circle cx="97" cy="132" r="1.3" fill="#FFFFFF" />
          <circle cx="143" cy="127" r="3" fill="#FFFFFF" />
          <circle cx="147" cy="132" r="1.3" fill="#FFFFFF" />
        </g>
      )}

      {/* Cute Round Glasses with Glass Glint */}
      {/* Left Eyeglass Frame */}
      <circle
        cx="95"
        cy="130"
        r="23"
        fill="url(#lens-glint)"
        stroke="#1E293B"
        strokeWidth="3.5"
      />
      {/* Right Eyeglass Frame */}
      <circle
        cx="145"
        cy="130"
        r="23"
        fill="url(#lens-glint)"
        stroke="#1E293B"
        strokeWidth="3.5"
      />
      {/* Bridge Between Glasses */}
      <path
        d="M 118 127 Q 120 124 122 127"
        stroke="#1E293B"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Glass Corner Glint Stripe */}
      <line x1="80" y1="116" x2="90" y2="126" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="130" y1="116" x2="140" y2="126" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

      {/* Mouth */}
      <motion.g
        animate={{
          scaleY: mouthOpenY,
          originY: '166px',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {isSpeaking ? (
          <path
            d="M 110 166 Q 120 182 130 166 Z"
            fill="#B91C1C"
            stroke="#1F2937"
            strokeWidth="2"
          />
        ) : (
          <path
            d="M 112 165 Q 120 173 128 165"
            stroke="#1F2937"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </motion.g>

      {/* Sophisticated Crimson Bow Tie */}
      <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.25))">
        {/* Left Wing */}
        <polygon points="120,192 98,183 98,201" fill="url(#bowtie-grad)" stroke="#7F1D1D" strokeWidth="1.2" />
        {/* Right Wing */}
        <polygon points="120,192 142,183 142,201" fill="url(#bowtie-grad)" stroke="#7F1D1D" strokeWidth="1.2" />
        {/* Center Knot */}
        <rect x="115" y="186" width="10" height="12" rx="4" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.2" />
        {/* Knot highlight */}
        <circle cx="118" cy="189" r="1.5" fill="#FCA5A5" />
      </g>
    </svg>
  );
};
