import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../types';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  isAutoDetect?: boolean;
  onToggleAutoDetect?: (enabled: boolean) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  isAutoDetect,
  onToggleAutoDetect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLangConfig =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        className={`flex items-center gap-2 rounded-xl border border-white/10 bg-[#171B2B]/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-purple-500/40 hover:bg-[#1F2438] ${
          isOpen ? 'border-purple-500/50 shadow-glow-primary' : ''
        }`}
      >
        <Globe className="h-3.5 w-3.5 text-cyan-400" />
        <span className="text-sm">{activeLangConfig.flag}</span>
        <span className="font-semibold text-white">{activeLangConfig.nativeName}</span>
        {isAutoDetect && (
          <span className="flex items-center gap-0.5 rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/20">
            <Sparkles className="h-2.5 w-2.5" />
            Auto
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#171B2B] p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Choose Language
          </div>

          <div className="space-y-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <div className="font-semibold text-white">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-400">{lang.name} ({lang.code})</div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-purple-400" />}
                </button>
              );
            })}
          </div>

          {onToggleAutoDetect && (
            <div className="mt-2 border-t border-white/10 pt-2 px-1">
              <label className="flex items-center justify-between cursor-pointer rounded-xl px-2 py-1.5 hover:bg-white/5">
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  Auto-detect language
                </span>
                <input
                  type="checkbox"
                  checked={isAutoDetect}
                  onChange={(e) => onToggleAutoDetect(e.target.checked)}
                  className="rounded border-white/20 bg-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
