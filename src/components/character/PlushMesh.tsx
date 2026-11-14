import React from 'react';

/**
 * Shared SVG filters and gradients for tactile 3D plush fabric:
 * - Plush fleece bump/fiber displacement
 * - Soft fabric drop shadows
 * - Specular dome lighting for rounded volume
 */
export const PlushMeshDefs: React.FC = () => {
  return (
    <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <defs>
        {/* 3D Plush Drop Shadow */}
        <filter id="plush-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.35" />
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.2" />
        </filter>

        {/* Plush Felt Fabric Texture filter */}
        <filter id="fabric-fuzz" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0"
            result="coloredNoise"
          />
          <feComposite in="SourceGraphic" in2="coloredNoise" operator="in" />
        </filter>

        {/* Glossy Button / Glass Eye Specular reflection */}
        <linearGradient id="eye-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Glasses metallic lens sheen */}
        <linearGradient id="lens-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
        </linearGradient>

        {/* Sunglasses Gradient */}
        <linearGradient id="sunglasses-lens" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
      </defs>
    </svg>
  );
};
