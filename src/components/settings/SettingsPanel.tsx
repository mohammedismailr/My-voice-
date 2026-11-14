import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Globe, Sliders, ShieldCheck } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, type VoiceSettings } from '../../types';
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
}) => {
  const { isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<'voice' | 'general' | 'about'>('voice');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#171B2B] shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                  <Sliders className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-white">Settings & Preferences</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/5 px-6 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-semibold transition-all ${
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
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-semibold transition-all ${
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
                className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-semibold transition-all ${
                  activeTab === 'about'
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                System & Info
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {activeTab === 'voice' && (
                <div className="space-y-4">
                  {/* Auto Speak Toggle */}
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3.5 border border-white/5">
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
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Speech Rate</span>
                      <span className="text-purple-400 font-mono">{voiceSettings.rate.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.6"
                      step="0.1"
                      value={voiceSettings.rate}
                      onChange={(e) => onUpdateVoiceSettings({ rate: parseFloat(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Speech Pitch */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Speech Pitch</span>
                      <span className="text-purple-400 font-mono">{voiceSettings.pitch.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.4"
                      step="0.1"
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
                            ? 'नमस्ते! यह माय वॉयस एआई वॉयस टेस्ट है।'
                            : selectedLanguage === 'kn-IN'
                            ? 'ನಮಸ್ಕಾರ! ಇದು ಮೈ ವಾಯ್ಸ್ ಧ್ವನಿ ಪರೀಕ್ಷೆ.'
                            : 'Hello! This is a voice test for MyVoice conversational AI.';
                        onTestVoice(sample, selectedLanguage);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/10 p-2.5 text-xs font-semibold text-purple-300 hover:bg-purple-600/20 transition-all"
                    >
                      <Volume2 className="h-4 w-4" />
                      Test Voice Output ({selectedLanguage})
                    </button>
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
                          className={`flex items-center justify-between rounded-xl p-3 text-left text-xs transition-all ${
                            selectedLanguage === lang.code
                              ? 'border border-purple-500/50 bg-purple-600/20 text-white'
                              : 'border border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{lang.flag}</span>
                            <div>
                              <p className="font-semibold text-white">{lang.nativeName}</p>
                              <p className="text-[10px] text-slate-400">{lang.name}</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">{lang.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Application</span>
                      <span className="text-white font-medium">MyVoice Platform v1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">AI Intelligence</span>
                      <span className="text-cyan-300 font-medium">Google Gemini 1.5 Flash</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Speech Recognition</span>
                      <span className={isSpeechRecognitionSupported ? 'text-emerald-400' : 'text-amber-400'}>
                        {isSpeechRecognitionSupported ? 'Web Speech API (Ready)' : 'Not Supported'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Speech Synthesis</span>
                      <span className={isSpeechSynthesisSupported ? 'text-emerald-400' : 'text-amber-400'}>
                        {isSpeechSynthesisSupported ? 'Web Speech API (Ready)' : 'Not Supported'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Database & Auth</span>
                      <span className={isConfigured ? 'text-emerald-400' : 'text-purple-300'}>
                        {isConfigured ? 'Supabase Connected' : 'Local / Demo Mode'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    MyVoice uses client-side native browser speech capabilities combined with server-side Google Gemini conversational intelligence.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-6 py-3 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors"
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
