import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import type { CharacterId, CharacterConfig } from '../../types/character';
import { CHARACTER_LIST } from '../../data/characters';

interface CharacterSelectorProps {
  selectedId: CharacterId;
  onSelect: (id: CharacterId) => void;
  compact?: boolean;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  selectedId,
  onSelect,
  compact = false,
}) => {
  return (
    <div className="w-full">
      {!compact && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Your 3D Plush Companion
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">5 Companions</span>
        </div>
      )}

      {/* Character Carousel / Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {CHARACTER_LIST.map((char: CharacterConfig) => {
          const isSelected = selectedId === char.id;

          return (
            <motion.button
              key={char.id}
              type="button"
              onClick={() => onSelect(char.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center rounded-2xl p-3 text-center transition-all cursor-pointer backdrop-blur-xl ${
                isSelected
                  ? 'border-2 bg-gradient-to-b from-[#20253B] to-[#151928] shadow-2xl'
                  : 'border border-white/10 bg-[#171B2B]/70 hover:bg-[#1C2136] hover:border-white/20'
              }`}
              style={{
                borderColor: isSelected ? char.colors.primary : undefined,
                boxShadow: isSelected ? `0 0 25px -4px ${char.colors.glow}` : undefined,
              }}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm"
                  style={{ backgroundColor: char.colors.primary }}
                >
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}

              {/* Character Visual Avatar Preview */}
              <div
                className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl mb-2 transition-transform"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${char.colors.surfaceGrad[0]}, ${char.colors.surfaceGrad[1]}, ${char.colors.surfaceGrad[2]})`,
                  boxShadow: `0 6px 14px -2px ${char.colors.shadow}`,
                }}
              >
                {/* Micro preview icons/symbols based on character species */}
                {char.id === 'beige-mascot' && (
                  <span className="text-2xl drop-shadow select-none">🎧</span>
                )}
                {char.id === 'yellow-triangle' && (
                  <span className="text-2xl drop-shadow select-none">👓</span>
                )}
                {char.id === 'blue-cloud' && (
                  <span className="text-2xl drop-shadow select-none">☁️</span>
                )}
                {char.id === 'pink-bunny' && (
                  <span className="text-2xl drop-shadow select-none">🐰</span>
                )}
                {char.id === 'purple-heart' && (
                  <span className="text-2xl drop-shadow select-none">💜</span>
                )}
              </div>

              {/* Character Details */}
              <div className="w-full">
                <p className="text-xs font-bold text-white tracking-tight truncate">{char.name}</p>
                <p
                  className="text-[10px] font-semibold tracking-wide truncate mt-0.5"
                  style={{ color: char.colors.primary }}
                >
                  {char.personality}
                </p>
                {!compact && (
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                    {char.description}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
