import React from 'react';
import { motion } from 'framer-motion';
import type { VoiceState } from '../../types';

interface CharacterArtProps {
  state: VoiceState;
  audioLevel: number;
  isBlinking: boolean;
}

export const BeigeHoodedMascot: React.FC<CharacterArtProps> = ({
  state,
  audioLevel,
  isBlinking,
}) => {
  const isListening = state === 'listening' || state === 'speech_detected';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'processing' || state === 'generating';
  const isError = state === 'error';

  // Compute mouth open scale based on state and real audioLevel
  const mouthOpenY = isSpeaking ? Math.max(0.4, audioLevel * 1.6) : isListening ? 0.3 : 0.1;

  return (
    <svg viewBox="0 0 240 240" className="w-full h-full select-none" fill="none">
      <defs>
        {/* Soft Hood Gradient */}
        <radialGradient id="hood-grad" cx="45%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#F9EEDD" />
          <stop offset="60%" stopColor="#E5D1B3" />
          <stop offset="100%" stopColor="#BFA583" />
        </radialGradient>

        {/* Inner Face Gradient */}
        <radialGradient id="face-grad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFF7EC" />
          <stop offset="70%" stopColor="#F2DFC7" />
          <stop offset="100%" stopColor="#DECAA8" />
        </radialGradient>

        {/* Headphone Cushion Gradient */}
        <radialGradient id="headphone-cup" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="65%" stopColor="#18181B" />
          <stop offset="100%" stopColor="#09090B" />
        </radialGradient>
      </defs>

      {/* Headphone Arch */}
      <motion.path
        d="M 46 112 C 44 48, 196 48, 194 112"
        stroke="#27272A"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
        animate={isListening ? { stroke: '#38BDF8', strokeWidth: 12 } : { stroke: '#27272A' }}
        transition={{ duration: 0.3 }}
      />
      <path
        d="M 52 110 C 50 56, 188 56, 188 110"
        stroke="#52525B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Outer Hood Body (Tactile Plush shape) */}
      <path
        d="M 120 30 C 58 30, 40 85, 42 142 C 44 195, 76 215, 120 215 C 164 215, 196 195, 198 142 C 200 85, 182 30, 120 30 Z"
        fill="url(#hood-grad)"
        filter="drop-shadow(0 12px 16px rgba(0,0,0,0.25))"
      />

      {/* Outer Hood Stitches */}
      <path
        d="M 120 36 C 65 36, 48 88, 50 140 C 52 188, 80 207, 120 207 C 160 207, 188 188, 190 140 C 192 88, 175 36, 120 36 Z"
        stroke="rgba(120, 90, 50, 0.28)"
        strokeWidth="1.8"
        strokeDasharray="4 3"
        fill="none"
      />

      {/* Hood Opening / Face Cavity */}
      <ellipse cx="120" cy="132" rx="55" ry="52" fill="url(#face-grad)" />

      {/* Hood Rim Shadow */}
      <path
        d="M 68 128 C 68 85, 172 85, 172 128 C 172 165, 155 180, 120 180 C 85 180, 68 165, 68 128 Z"
        fill="none"
        stroke="rgba(100, 75, 40, 0.25)"
        strokeWidth="4"
      />

      {/* Rosy Cheeks */}
      <motion.ellipse
        cx="82"
        cy="142"
        rx="12"
        ry="7"
        fill="#F87171"
        opacity="0.45"
        animate={isSpeaking || isListening ? { opacity: [0.45, 0.7, 0.45], scale: [1, 1.1, 1] } : { opacity: 0.45 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.ellipse
        cx="158"
        cy="142"
        rx="12"
        ry="7"
        fill="#F87171"
        opacity="0.45"
        animate={isSpeaking || isListening ? { opacity: [0.45, 0.7, 0.45], scale: [1, 1.1, 1] } : { opacity: 0.45 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Cute Eyes */}
      {isBlinking ? (
        // Blinking lines
        <g stroke="#1E1B18" strokeWidth="3.5" strokeLinecap="round">
          <line x1="90" y1="126" x2="104" y2="126" />
          <line x1="136" y1="126" x2="150" y2="126" />
        </g>
      ) : isError ? (
        // Gentle questioning/apologetic eyes
        <g stroke="#1E1B18" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 88 128 Q 97 122 106 128" />
          <path d="M 134 128 Q 143 122 152 128" />
          {/* Gentle question mark near head */}
          <text x="175" y="85" fill="#F87171" fontSize="18" fontWeight="bold">?</text>
        </g>
      ) : isThinking ? (
        // Curious eyes looking slightly upward
        <g fill="#1E1B18">
          <circle cx="97" cy="120" r="7.5" />
          <circle cx="143" cy="120" r="7.5" />
          {/* Catchlight */}
          <circle cx="99" cy="118" r="2.8" fill="#FFFFFF" />
          <circle cx="145" cy="118" r="2.8" fill="#FFFFFF" />
        </g>
      ) : (
        // Normal wide sparkling eyes
        <g fill="#1E1B18">
          <circle cx="97" cy="126" r="7.5" />
          <circle cx="143" cy="126" r="7.5" />
          {/* Dual Catchlights for glassy luster */}
          <circle cx="95" cy="123" r="2.8" fill="#FFFFFF" />
          <circle cx="99" cy="128" r="1.2" fill="#FFFFFF" />
          <circle cx="141" cy="123" r="2.8" fill="#FFFFFF" />
          <circle cx="145" cy="128" r="1.2" fill="#FFFFFF" />
        </g>
      )}

      {/* Cute Little Button Nose */}
      <ellipse cx="120" cy="136" rx="4" ry="3" fill="#8C6E4A" opacity="0.6" />

      {/* Mouth (reacts smoothly to speech & listening) */}
      <motion.g
        animate={{
          scaleY: mouthOpenY,
          originY: '146px',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {isSpeaking ? (
          // Animated open smiling mouth
          <path
            d="M 111 146 Q 120 160 129 146 Z"
            fill="#E11D48"
            stroke="#1E1B18"
            strokeWidth="2"
          />
        ) : (
          // Sweet gentle smile
          <path
            d="M 112 144 Q 120 151 128 144"
            stroke="#1E1B18"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </motion.g>

      {/* Hoodie Drawstrings with Felt Toggles */}
      <g stroke="#F5E6D3" strokeWidth="3" strokeLinecap="round">
        <path d="M 100 188 Q 97 202 96 216" />
        <circle cx="96" cy="218" r="4.5" fill="#D0BA95" stroke="#9A7B54" strokeWidth="1.5" />
        <path d="M 140 188 Q 143 202 144 216" />
        <circle cx="144" cy="218" r="4.5" fill="#D0BA95" stroke="#9A7B54" strokeWidth="1.5" />
      </g>

      {/* Over-Ear Black Plush Headphones */}
      {/* Left Ear Cushion */}
      <g filter="drop-shadow(-3px 4px 6px rgba(0,0,0,0.3))">
        <rect
          x="28"
          y="105"
          width="24"
          height="52"
          rx="12"
          fill="url(#headphone-cup)"
          stroke="#52525B"
          strokeWidth="1.5"
        />
        {/* Glowing Indicator Pill */}
        <motion.circle
          cx="40"
          cy="131"
          r="4"
          fill={isListening ? '#38BDF8' : isSpeaking ? '#A855F7' : '#71717A'}
          animate={isListening || isSpeaking ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </g>

      {/* Right Ear Cushion */}
      <g filter="drop-shadow(3px 4px 6px rgba(0,0,0,0.3))">
        <rect
          x="188"
          y="105"
          width="24"
          height="52"
          rx="12"
          fill="url(#headphone-cup)"
          stroke="#52525B"
          strokeWidth="1.5"
        />
        {/* Glowing Indicator Pill */}
        <motion.circle
          cx="200"
          cy="131"
          r="4"
          fill={isListening ? '#38BDF8' : isSpeaking ? '#A855F7' : '#71717A'}
          animate={isListening || isSpeaking ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </g>
    </svg>
  );
};
