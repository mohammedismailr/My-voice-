import React from 'react';
import {
  Sparkles,
  Cpu,
  Volume2,
  ChevronRight,
  Zap,
  MessageSquare,
} from 'lucide-react';
import type { CharacterConfig } from '../../types/character';
import type { AiModelConfig } from '../../data/models';
import type { VoiceSettings, SupportedLanguage } from '../../types';
import { SOFT_VOICE_PROFILES } from '../../data/voiceProfiles';

interface CompanionInspectorProps {
  companion: CharacterConfig;
  activeModel: AiModelConfig;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  onOpenCompanions: () => void;
  onOpenModels: () => void;
  onTestVoice: () => void;
  onTriggerGreeting: () => void;
  messagesCount: number;
  selectedLanguage: SupportedLanguage;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const CompanionInspector: React.FC<CompanionInspectorProps> = ({
  companion,
  activeModel,
  voiceSettings,
  onUpdateVoiceSettings,
  onOpenCompanions,
  onOpenModels,
  onTestVoice,
  onTriggerGreeting,
  messagesCount,
  selectedLanguage,
}) => {
  const activeProfile =
    SOFT_VOICE_PROFILES[voiceSettings.selectedVoiceProfileId] ||
    SOFT_VOICE_PROFILES['soft-warm'];

  return (
    <aside className="w-80 flex-shrink-0 flex-col h-full bg-[#101225] border-l border-white/5 overflow-y-auto p-4 space-y-4 select-none">
      {/* 1. Companion Profile Card */}
      <div className="relative rounded-3xl border border-white/10 bg-[#171B2B]/80 p-4.5 overflow-hidden shadow-lg">
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40"
          style={{ backgroundColor: companion.colors.primary }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: companion.colors.primary }} />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Active Companion</span>
          </div>
          <button
            type="button"
            onClick={onOpenCompanions}
            className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-0.5 cursor-pointer"
          >
            <span>Change</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl border text-xl shadow-md"
            style={{
              backgroundColor: `${companion.colors.primary}20`,
              borderColor: `${companion.colors.primary}50`,
            }}
          >
            {companion.id === 'beige-mascot' && '🧸'}
            {companion.id === 'blue-cloud' && '☁️'}
            {companion.id === 'pink-bunny' && '🐰'}
            {companion.id === 'yellow-triangle' && '📐'}
            {companion.id === 'purple-heart' && '💜'}
          </div>

          <div>
            <h4 className="text-base font-bold text-white font-display">{companion.name}</h4>
            <p className="text-xs text-purple-300">{companion.personality}</p>
          </div>
        </div>

        <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
          {companion.description}
        </p>

        {/* Personality Traits */}
        <div className="mt-3 flex flex-wrap gap-1">
          {companion.traits.map((t, idx) => (
            <span
              key={idx}
              className="text-[10px] rounded-md px-2 py-0.5 bg-white/5 border border-white/5 text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Say Hello Button */}
        <button
          type="button"
          onClick={onTriggerGreeting}
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Say Hello ({companion.name})</span>
        </button>
      </div>

      {/* 2. Active AI Intelligence Engine */}
      <div className="rounded-3xl border border-white/10 bg-[#171B2B]/80 p-4 shadow-lg">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">AI Model</span>
          </div>
          <button
            type="button"
            onClick={onOpenModels}
            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5 cursor-pointer"
          >
            <span>Switch</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">{activeModel.name}</span>
            <span className="text-[10px] rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 px-1.5 py-0.5 font-semibold">
              {activeModel.badge}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
            {activeModel.description}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" />
              {activeModel.speed}
            </span>
            <span>•</span>
            <span>{activeModel.latencyMs}ms avg</span>
          </div>
        </div>
      </div>

      {/* 3. Ultra-Soft Natural Voice System */}
      <div className="rounded-3xl border border-white/10 bg-[#171B2B]/80 p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Soft AI Voice</span>
          </div>
          <button
            type="button"
            onClick={onTestVoice}
            className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors underline cursor-pointer"
          >
            Test Audio
          </button>
        </div>

        {/* Adaptive Switching Status */}
        <div className="flex items-center justify-between rounded-xl bg-[#101225] p-2.5 border border-white/5 text-xs">
          <div>
            <p className="font-semibold text-white">Adaptive Voice</p>
            <p className="text-[10px] text-slate-400">Sync voice to AI model</p>
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdateVoiceSettings({ adaptiveVoice: !voiceSettings.adaptiveVoice })
            }
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
              voiceSettings.adaptiveVoice ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                voiceSettings.adaptiveVoice ? 'translate-x-4.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Voice Profile Badge */}
        <div className="rounded-xl bg-[#101225] p-2.5 border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">{activeProfile.name}</span>
            <span className="text-[10px] text-cyan-300">{activeProfile.tone}</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            {activeProfile.description}
          </p>
        </div>

        {/* Sliders: Speed & Pitch */}
        <div className="space-y-2 pt-1">
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Speaking Speed</span>
              <span>{Math.round(voiceSettings.rate * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.02"
              value={voiceSettings.rate}
              onChange={(e) =>
                onUpdateVoiceSettings({ rate: parseFloat(e.target.value) })
              }
              className="w-full accent-purple-500 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Voice Pitch</span>
              <span>{Math.round(voiceSettings.pitch * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.25"
              step="0.02"
              value={voiceSettings.pitch}
              onChange={(e) =>
                onUpdateVoiceSettings({ pitch: parseFloat(e.target.value) })
              }
              className="w-full accent-purple-500 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Active Session Stats */}
      <div className="rounded-2xl border border-white/5 bg-[#171B2B]/50 p-3 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3 text-slate-500" />
            <span>Messages in Session</span>
          </span>
          <span className="font-bold text-white">{messagesCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Active Language</span>
          <span className="font-semibold text-purple-300 uppercase">{selectedLanguage}</span>
        </div>
      </div>
    </aside>
  );
};
