import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import type { Conversation } from '../../types';
import { formatTimestamp } from '../../utils';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDeleteRequest: (id: string, e: React.MouseEvent) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onDeleteRequest,
}) => {
  return (
    <div
      onClick={() => onSelect(conversation.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(conversation.id);
        }
      }}
      className={`group relative flex w-full cursor-pointer items-center justify-between rounded-xl p-3 text-left transition-all ${
        isActive
          ? 'bg-purple-600/20 border border-purple-500/40 text-white shadow-glow-primary'
          : 'border border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
            isActive ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-xs font-medium leading-snug">{conversation.title}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span>{formatTimestamp(conversation.updated_at || conversation.created_at)}</span>
            <span>•</span>
            <span className="uppercase">{conversation.language || 'en-US'}</span>
          </div>
        </div>
      </div>

      {/* Delete button (visible on hover or active) */}
      <button
        type="button"
        onClick={(e) => onDeleteRequest(conversation.id, e)}
        title="Delete conversation"
        className="opacity-0 group-hover:opacity-100 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all ml-1"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
