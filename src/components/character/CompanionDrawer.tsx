import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Volume2 } from 'lucide-react';
import { CHARACTERS } from '../../data/characters';
import type { CharacterConfig, CharacterId } from '../../types/character';
import { PlushCharacter } from './PlushCharacter';

interface CompanionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCharacterId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
  onGreetingPreview?: (character: CharacterConfig) => void;
}

export const CompanionDrawer: React.FC<CompanionDrawerProps> = ({
  isOpen,
  onClose,
  activeCharacterId,
  onSelectCharacter,
  onGreetingPreview,
}) => {
  if (!isOpen) return null;

  const charactersList = Object.values(CHARACTERS);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#101225] p-6 sm:p-8 shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Top Edge Specular Glow */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 flex-shrink-0">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs text-purple-300 font-semibold mb-1">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>3D Plush Companion Gallery</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Choose Your Little AI Companion
              </h2>
              <p className="text-xs text-[#A1A1B5]">
                Each friend brings their own unique warmth, conversational pitch, and cute interactive animations.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Companions Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1 flex-1">
            {charactersList.map((char) => {
              const isSelected = char.id === activeCharacterId;

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    onSelectCharacter(char.id);
                  }}
                  className={`relative rounded-3xl border p-5 flex flex-col items-center text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500/80 bg-gradient-to-b from-purple-900/30 via-[#171B2B] to-[#101225] shadow-[0_0_30px_rgba(139,92,246,0.3)]'
                      : 'border-white/5 bg-[#171B2B]/70 hover:border-purple-500/40 hover:bg-[#1C2136]'
                  }`}
                >
                  {/* Active Selected Pill */}
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      <Check className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  )}

                  {/* Character 3D Art Preview */}
                  <div className="h-36 w-36 flex items-center justify-center my-2">
                    <PlushCharacter
                      characterId={char.id}
                      state="idle"
                      size="md"
                      interactive={false}
                    />
                  </div>

                  {/* Character Name & Species */}
                  <h3 className="text-lg font-bold text-white">{char.name}</h3>
                  <p className="text-[11px] font-medium text-purple-300">{char.personality}</p>

                  {/* Description */}
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {char.description}
                  </p>

                  {/* Traits Pills */}
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {char.traits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] text-slate-300"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>

                  {/* Greeting Audio Preview Button */}
                  {onGreetingPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGreetingPreview(char);
                      }}
                      className="mt-4 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Hear Greeting</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
            <span>Click any companion card to select immediately</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 font-semibold text-white hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer shadow-sm"
            >
              Done Exploring
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
