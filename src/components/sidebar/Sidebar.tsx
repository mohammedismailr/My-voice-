import React, { useState, useMemo } from 'react';
import {
  Plus,
  Settings,
  LogOut,
  Sparkles,
  X,
  Search,
  Bot,
  Cpu,
} from 'lucide-react';
import type { Conversation } from '../../types';
import { ConversationList } from './ConversationList';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteRequest: (id: string, e: React.MouseEvent) => void;
  isLoading: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
  onOpenCompanions?: () => void;
  onOpenModels?: () => void;
  activeModelName?: string;
  activeCompanionName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteRequest,
  isLoading,
  isOpenMobile,
  onCloseMobile,
  onOpenSettings,
  onOpenCompanions,
  onOpenModels,
  activeModelName,
  activeCompanionName,
}) => {
  const { user, profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Guest Companion';
  const email = user?.email || 'guest@myvoice.ai';

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#101225] border-r border-white/5">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(139,92,246,0.35)]">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#080914]">
              <Sparkles className="h-5 w-5 text-purple-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white font-display">MyVoice</span>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.2 text-[9px] font-semibold text-cyan-300 border border-cyan-500/20">
                AI 3D
              </span>
            </div>
            <p className="text-[10px] text-[#A1A1B5]">Plush Conversational Intelligence</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 md:hidden cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* New Conversation Button */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            onNewConversation();
            onCloseMobile();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 p-3 text-xs font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:brightness-110 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Quick Navigation Cards: Companions & AI Models */}
      <div className="px-3 pb-2 space-y-1.5">
        {onOpenCompanions && (
          <button
            type="button"
            onClick={() => {
              onOpenCompanions();
              onCloseMobile();
            }}
            className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#171B2B]/70 px-3 py-2 text-xs font-medium text-slate-300 hover:border-purple-500/30 hover:bg-[#1E2338] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-400" />
              <span>Explore Companions</span>
            </div>
            {activeCompanionName && (
              <span className="rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">
                {activeCompanionName}
              </span>
            )}
          </button>
        )}

        {onOpenModels && (
          <button
            type="button"
            onClick={() => {
              onOpenModels();
              onCloseMobile();
            }}
            className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#171B2B]/70 px-3 py-2 text-xs font-medium text-slate-300 hover:border-cyan-500/30 hover:bg-[#1E2338] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>AI Intelligence Models</span>
            </div>
            {activeModelName && (
              <span className="truncate max-w-[100px] text-[10px] text-slate-400">
                {activeModelName.split(' ')[1] || 'Flash'}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Search Conversation Bar */}
      {conversations.length > 2 && (
        <div className="px-3 py-1">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full rounded-lg border border-white/5 bg-[#080914] py-1.5 pl-8 pr-3 text-[11px] text-white placeholder-slate-500 focus:border-purple-500/40 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Conversation History List */}
      <div className="flex-1 overflow-y-auto px-1 mt-1">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#A1A1B5]">
          Recent Conversations ({conversations.length})
        </div>
        <ConversationList
          conversations={filteredConversations}
          activeId={activeConversationId}
          onSelect={(id) => {
            onSelectConversation(id);
            onCloseMobile();
          }}
          onDeleteRequest={onDeleteRequest}
          isLoading={isLoading}
        />
      </div>

      {/* User Profile & Actions Footer */}
      <div className="border-t border-white/5 p-3 space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-[#171B2B] p-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/30 to-indigo-500/20 text-purple-200 font-semibold text-xs border border-purple-500/30">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">{displayName}</p>
              <p className="truncate text-[10px] text-[#A1A1B5]">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-72 flex-col flex-shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sliding Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative flex h-full w-4/5 max-w-xs flex-col shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
