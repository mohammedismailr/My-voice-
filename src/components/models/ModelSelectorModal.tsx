import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Cpu, Zap, Volume2, Shield } from 'lucide-react';
import { AI_MODELS, type AiModelConfig } from '../../data/models';
import { SOFT_VOICE_PROFILES, MODEL_TO_VOICE_MAP } from '../../data/voiceProfiles';

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModelId: string;
  onSelectModel: (model: AiModelConfig) => void;
  onTestVoice?: (profileId: string) => void;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
  activeModelId,
  onSelectModel,
  onTestVoice,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#101225] p-6 shadow-2xl z-10 overflow-hidden"
        >
          {/* Top glowing ambient highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>AI Intelligence Engines</span>
                  <span className="text-[10px] rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 font-semibold">
                    Google Gemini
                  </span>
                </h3>
                <p className="text-xs text-[#A1A1B5]">
                  Select an engine. MyVoice will adaptively tune its soft companion voice to match.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Model Cards Grid */}
          <div className="mt-5 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {AI_MODELS.map((model) => {
              const isActive = model.id === activeModelId;
              const voiceProfileId = MODEL_TO_VOICE_MAP[model.id] || 'soft-warm';
              const voiceProfile = SOFT_VOICE_PROFILES[voiceProfileId];

              return (
                <div
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model);
                    onClose();
                  }}
                  className={`group relative rounded-2xl border p-4.5 transition-all cursor-pointer ${
                    isActive
                      ? 'border-purple-500/60 bg-gradient-to-r from-purple-900/25 via-indigo-950/20 to-transparent shadow-[0_0_25px_rgba(139,92,246,0.25)]'
                      : 'border-white/5 bg-[#171B2B]/60 hover:border-purple-500/30 hover:bg-[#1A1E32]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Title & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                          {model.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                              : 'bg-white/5 border-white/10 text-slate-400'
                          }`}
                        >
                          {model.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-400" />
                          {model.speed} ({model.latencyMs}ms)
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                        {model.description}
                      </p>

                      {/* Adaptive Soft Voice Pill */}
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-[11px] text-purple-300">
                          <Volume2 className="h-3 w-3 text-cyan-400" />
                          <span>Adaptive Voice:</span>
                          <span className="font-semibold text-white">{voiceProfile?.name || 'Soft Warm'}</span>
                          <span className="text-[10px] text-slate-400">({voiceProfile?.tone})</span>
                        </div>

                        {onTestVoice && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTestVoice(voiceProfileId);
                            }}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
                          >
                            Preview Voice
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Active Checkmark */}
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                        isActive
                          ? 'border-purple-500 bg-purple-600 text-white shadow-glow-primary'
                          : 'border-white/15 bg-white/5 text-transparent group-hover:border-purple-500/40'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              Connected via secure Google Generative AI gateway
            </span>
            <span className="text-slate-400">Automatic model-to-voice synchronization active</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
