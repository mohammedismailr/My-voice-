import React from 'react';
import { Plus, Settings, LogOut, Sparkles, X } from 'lucide-react';
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
}) => {
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'user@myvoice.ai';

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#101321] border-r border-white/5">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 shadow-glow-primary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">MyVoice</span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-cyan-300 border border-cyan-500/20">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Conversational Intelligence</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 md:hidden"
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-3 text-xs font-semibold text-white shadow-glow-primary hover:from-purple-500 hover:to-indigo-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Conversation History List */}
      <div className="flex-1 overflow-y-auto px-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Recent Conversations ({conversations.length})
        </div>
        <ConversationList
          conversations={conversations}
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
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-semibold text-xs border border-purple-500/30">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">{displayName}</p>
              <p className="truncate text-[10px] text-slate-500">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
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
