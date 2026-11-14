import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Globe, Sliders, ShieldCheck, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, type VoiceSettings } from '../../types';
import { SOFT_VOICE_PROFILES } from '../../data/voiceProfiles';
import { useAuth } from '../../hooks/useAuth';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  onTestVoice: (text: string, lang: SupportedLanguage) => void;
  isSpeechRecognitionSupported: boolean;
  isSpeechSynthesisSupported: boolean;
  activeModelName?: string;
  activeCompanionName?: string;
  onOpenCompanions?: () => void;
  onOpenModels?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
  voiceSettings,
  onUpdateVoiceSettings,
  onTestVoice,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  activeModelName = 'Gemini 3.5 Flash Lite',
  activeCompanionName = 'Mochi',
  onOpenCompanions,
  onOpenModels,
}) => {
  const { isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<'voice' | 'companion' | 'general' | 'about'>('voice');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#121424] shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4.5 bg-[#0C0E1C]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Sliders className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Settings & Preferences</h3>
                  <p className="text-[11px] text-slate-400">Configure companion audio, models, and language</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/5 px-6 pt-2 bg-[#0C0E1C]/50">
              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'voice'
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Volume2 className="h-3.5 w-3.5" />
                Voice & Audio
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('companion')}
                className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'companion'
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI & Personality
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'general'
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                Language
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'about'
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                System Info
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {activeTab === 'voice' && (
                <div className="space-y-4">
                  {/* Adaptive Voice Mode */}
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                        Adaptive Soft Voice
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Automatically match voice profile to the active AI model
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceSettings.adaptiveVoice}
                        onChange={(e) => onUpdateVoiceSettings({ adaptiveVoice: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-cyan-500"></div>
                    </label>
                  </div>

                  {/* Soft Voice Profile Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Voice Profile</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(SOFT_VOICE_PROFILES).map((profile) => (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => {
                            onUpdateVoiceSettings({
                              selectedVoiceProfileId: profile.id,
                              pitch: profile.pitch,
                              rate: profile.rate,
                            });
                          }}
                          className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                            voiceSettings.selectedVoiceProfileId === profile.id
                              ? 'border-purple-500 bg-purple-500/20 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                              : 'border-white/5 bg-white/5 text-slate-300 hover:border-white/15'
                          }`}
                        >
                          <p className="text-xs font-bold">{profile.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{profile.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto Speak Toggle */}
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Auto-Read AI Responses</p>
                      <p className="text-[11px] text-slate-400">Speak AI responses aloud automatically</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceSettings.autoSpeak}
                        onChange={(e) => onUpdateVoiceSettings({ autoSpeak: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Speech Rate */}
                  <div className="space-y-1.5 rounded-2xl bg-white/5 p-3.5 border border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Speech Rate</span>
                      <span className="text-cyan-400 font-mono font-semibold">{voiceSettings.rate.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.5"
                      step="0.02"
                      value={voiceSettings.rate}
                      onChange={(e) => onUpdateVoiceSettings({ rate: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Speech Pitch */}
                  <div className="space-y-1.5 rounded-2xl bg-white/5 p-3.5 border border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Speech Pitch</span>
                      <span className="text-purple-400 font-mono font-semibold">{voiceSettings.pitch.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.4"
                      step="0.02"
                      value={voiceSettings.pitch}
                      onChange={(e) => onUpdateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Voice Test Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const sample =
                          selectedLanguage === 'hi-IN'
                            ? 'नमस्ते! यह माय वॉयस एआई सॉफ्ट वॉयस टेस्ट है।'
                            : selectedLanguage === 'kn-IN'
                            ? 'ನಮಸ್ಕಾರ! ಇದು ಮೈ ವಾಯ್ಸ್ ಧ್ವನಿ ಪರೀಕ್ಷೆ.'
                            : 'Hello! I am your MyVoice AI plush companion. How can I help you today?';
                        onTestVoice(sample, selectedLanguage);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-600/20 p-3 text-xs font-semibold text-purple-300 hover:bg-purple-600/30 transition-all cursor-pointer shadow-lg"
                    >
                      <Volume2 className="h-4 w-4" />
                      Test Voice Output ({selectedLanguage})
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'companion' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Current Companion</p>
                      <h4 className="text-sm font-bold text-white mt-0.5">{activeCompanionName}</h4>
                    </div>
                    {onOpenCompanions && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCompanions();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-xs font-semibold text-white hover:bg-purple-500 transition-colors cursor-pointer"
                      >
                        Explore All 5
                      </button>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Active AI Model</p>
                      <h4 className="text-sm font-bold text-cyan-300 mt-0.5">{activeModelName}</h4>
                    </div>
                    {onOpenModels && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenModels();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-xs font-semibold text-cyan-200 hover:bg-cyan-600/50 transition-colors cursor-pointer"
                      >
                        Switch Model
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white">Default Preferred Language</label>
                    <div className="grid grid-cols-1 gap-2">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => onSelectLanguage(lang.code)}
                          className={`flex items-center justify-between rounded-2xl p-3.5 text-left text-xs transition-all cursor-pointer ${
                            selectedLanguage === lang.code
                              ? 'border border-purple-500/50 bg-purple-600/20 text-white shadow-lg'
                              : 'border border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{lang.flag}</span>
                            <div>
                              <p className="font-semibold text-white">{lang.nativeName}</p>
                              <p className="text-[10px] text-slate-400">{lang.name}</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono font-medium">{lang.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-3 text-xs">
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Application</span>
                      <span className="text-white font-semibold">MyVoice AI Companion v2.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">AI Engine</span>
                      <span className="text-cyan-300 font-semibold">Google Gemini Multi-Model API</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">3D Graphics</span>
                      <span className="text-purple-300 font-semibold">Three.js WebGL Plush Shaders</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Speech Recognition</span>
                      <span className={isSpeechRecognitionSupported ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                        {isSpeechRecognitionSupported ? 'Web Speech API (Active)' : 'Not Supported'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Speech Synthesis</span>
                      <span className={isSpeechSynthesisSupported ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                        {isSpeechSynthesisSupported ? 'Adaptive Soft TTS (Active)' : 'Not Supported'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Database & Auth</span>
                      <span className={isConfigured ? 'text-emerald-400 font-medium' : 'text-purple-300'}>
                        {isConfigured ? 'Supabase Connected' : 'Guest Demo Mode (Active)'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    MyVoice blends real-time 3D procedural plush companion rendering with ultra-soft adaptive voice synthesis and Google Gemini intelligence.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-6 py-3.5 flex justify-end bg-[#0C0E1C]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
