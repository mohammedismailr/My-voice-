import React from 'react';
import { Menu, Plus, Settings, Cpu, PanelRight } from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import type { SupportedLanguage } from '../../types';
import type { AiModelConfig } from '../../data/models';

interface ChatHeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
  onNewConversation: () => void;
  onOpenSettings: () => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  isAutoDetect: boolean;
  onToggleAutoDetect: (enabled: boolean) => void;
  activeModel?: AiModelConfig;
  onOpenModels?: () => void;
  onToggleInspector?: () => void;
  isInspectorOpen?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  onOpenMobileMenu,
  onNewConversation,
  onOpenSettings,
  selectedLanguage,
  onSelectLanguage,
  isAutoDetect,
  onToggleAutoDetect,
  activeModel,
  onOpenModels,
  onToggleInspector,
  isInspectorOpen,
}) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#080914]/85 px-4 backdrop-blur-xl md:px-6 select-none">
      {/* Left: Mobile hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 md:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <h1 className="max-w-[180px] sm:max-w-xs md:max-w-md truncate text-sm md:text-base font-bold text-white font-display">
            {title}
          </h1>

          {/* Active Model Pill */}
          {activeModel && onOpenModels && (
            <button
              type="button"
              onClick={onOpenModels}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20 transition-all cursor-pointer"
            >
              <Cpu className="h-3 w-3 text-cyan-300" />
              <span>{activeModel.name.split(' ').slice(0, 2).join(' ')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language Selector */}
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onSelectLanguage={onSelectLanguage}
          isAutoDetect={isAutoDetect}
          onToggleAutoDetect={onToggleAutoDetect}
        />

        {/* New Chat Button */}
        <button
          type="button"
          onClick={onNewConversation}
          title="Start new conversation"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#171B2B] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-[#1F2438] hover:border-purple-500/30 transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 text-purple-400" />
          <span>New Chat</span>
        </button>

        {/* Toggle Right Inspector */}
        {onToggleInspector && (
          <button
            type="button"
            onClick={onToggleInspector}
            title={isInspectorOpen ? 'Hide companion panel' : 'Show companion panel'}
            className={`hidden lg:flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer ${
              isInspectorOpen
                ? 'border-purple-500/40 bg-purple-500/15 text-purple-300'
                : 'border-white/10 bg-[#171B2B] text-slate-400 hover:text-white'
            }`}
          >
            <PanelRight className="h-4 w-4" />
          </button>
        )}

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Open settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#171B2B] text-slate-400 hover:bg-[#1F2438] hover:text-white transition-all cursor-pointer"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
