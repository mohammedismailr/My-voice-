import { useState, useEffect, useCallback } from 'react';
import type { Conversation, SupportedLanguage } from '../types';
import {
  fetchConversations,
  deleteConversation as deleteConversationApi,
} from '../services/conversationService';
import { useAuth } from './useAuth';
import { DEMO_USER_UUID, isValidUUID } from '../utils/uuid';

export function useConversations() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchConversations(token || undefined);
      setConversations(data);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err.message || 'Failed to load conversation history');
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  // Initial load when user signs in
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const selectConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
  }, []);

  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  const removeConversation = useCallback(
    async (id: string) => {
      try {
        await deleteConversationApi(id, token || undefined);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
        }
      } catch (err: any) {
        console.error('Failed to delete conversation:', err);
        throw err;
      }
    },
    [token, activeConversationId]
  );

  const addOrUpdateConversation = useCallback(
    (newConv: { id: string; title: string; language: SupportedLanguage }) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === newConv.id);
        const now = new Date().toISOString();
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ...newConv,
            updated_at: now,
          };
          // Move to top
          const [item] = updated.splice(index, 1);
          return [item, ...updated];
        } else {
          const item: Conversation = {
            id: newConv.id,
            user_id: user?.id && isValidUUID(user.id) ? user.id : DEMO_USER_UUID,
            title: newConv.title,
            language: newConv.language,
            created_at: now,
            updated_at: now,
          };
          return [item, ...prev];
        }
      });
      setActiveConversationId(newConv.id);
    },
    [user?.id]
  );

  return {
    conversations,
    activeConversationId,
    isLoading,
    error,
    loadConversations,
    selectConversation,
    startNewConversation,
    removeConversation,
    addOrUpdateConversation,
  };
}
