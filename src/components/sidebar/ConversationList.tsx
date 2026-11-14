import React from 'react';
import { MessageSquareOff } from 'lucide-react';
import type { Conversation } from '../../types';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDeleteRequest: (id: string, e: React.MouseEvent) => void;
  isLoading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  onDeleteRequest,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-500">
          <MessageSquareOff className="h-5 w-5" />
        </div>
        <p className="mt-3 text-xs font-medium text-slate-400">No conversations yet</p>
        <p className="mt-1 text-[11px] text-slate-600">Start speaking or typing to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={activeId === conv.id}
          onSelect={onSelect}
          onDeleteRequest={onDeleteRequest}
        />
      ))}
    </div>
  );
};
