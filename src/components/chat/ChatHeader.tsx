import React from 'react';
import { Menu, Plus, Settings, Sparkles } from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import type { SupportedLanguage } from '../../types';

interface ChatHeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
  onNewConversation: () => void;
  onOpenSettings: () => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  isAutoDetect: boolean;
  onToggleAutoDetect: (enabled: boolean) => void;
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
}) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#090B14]/80 px-4 backdrop-blur-xl md:px-6">
      {/* Left: Mobile hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="max-w-[200px] sm:max-w-xs md:max-w-md truncate text-sm md:text-base font-semibold text-white">
            {title}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-300 border border-purple-500/20">
            <Sparkles className="h-2.5 w-2.5" />
            Gemini
          </span>
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
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#171B2B] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#1F2438] hover:border-purple-500/30 transition-all"
        >
          <Plus className="h-3.5 w-3.5 text-purple-400" />
          <span>New Chat</span>
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Open settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#171B2B] text-slate-400 hover:bg-[#1F2438] hover:text-white transition-all"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
