import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message, InputMode, SupportedLanguage } from '../types';
import { sendChatMessage } from '../services/chatService';
import { fetchConversationDetails } from '../services/conversationService';
import { useAuth } from './useAuth';
import { generateConversationTitle } from '../utils';

interface UseChatProps {
  activeConversationId: string | null;
  onConversationCreated?: (conv: { id: string; title: string; language: SupportedLanguage }) => void;
  onAssistantSpoke?: (text: string, language: SupportedLanguage) => void;
}

export function useChat({
  activeConversationId,
  onConversationCreated,
  onAssistantSpoke,
}: UseChatProps) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  // Load messages when conversation switches
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoadingMessages(true);
    setError(null);

    fetchConversationDetails(activeConversationId, token || undefined)
      .then(({ messages }) => {
        if (isMounted) {
          setMessages(messages);
          setIsLoadingMessages(false);
          setTimeout(() => scrollToBottom(false), 50);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          console.error('Failed to load conversation messages:', err);
          setError(err.message || 'Failed to load messages');
          setIsLoadingMessages(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeConversationId, token, scrollToBottom]);

  // Send message
  const sendMessage = useCallback(
    async (
      content: string,
      language: SupportedLanguage = 'en-US',
      inputMode: InputMode = 'text'
    ): Promise<boolean> => {
      const cleanContent = content.trim();
      if (!cleanContent) return false;

      setIsSending(true);
      setError(null);

      // Create optimistic user message
      const tempId = `temp-${Date.now()}`;
      const optimisticUserMsg: Message = {
        id: tempId,
        conversation_id: activeConversationId || 'pending',
        role: 'user',
        content: cleanContent,
        input_mode: inputMode,
        language,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticUserMsg]);
      setTimeout(() => scrollToBottom(true), 50);

      try {
        const response = await sendChatMessage(
          {
            conversationId: activeConversationId || undefined,
            message: cleanContent,
            language,
            inputMode,
          },
          token || undefined
        );

        if (!response.success) {
          throw new Error(response.error || 'Failed to get AI response');
        }

        // If a new conversation was created on the backend
        if (response.conversationId && response.conversationId !== activeConversationId) {
          const generatedTitle = generateConversationTitle(cleanContent);
          onConversationCreated?.({
            id: response.conversationId,
            title: generatedTitle,
            language,
          });
        }

        // Replace optimistic user message with confirmed messages from backend
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempId);
          const next = [...filtered];
          if (response.userMessage) {
            next.push(response.userMessage);
          } else {
            next.push(optimisticUserMsg);
          }
          if (response.assistantMessage) {
            next.push(response.assistantMessage);
          }
          return next;
        });

        setTimeout(() => scrollToBottom(true), 50);

        // Notify spoken playback if requested
        if (response.assistantMessage?.content) {
          onAssistantSpoke?.(response.assistantMessage.content, language);
        }

        setIsSending(false);
        return true;
      } catch (err: any) {
        console.error('Send message failed:', err);
        setError(err.message || 'AI response could not be generated. Please try again.');
        // Remove optimistic message or leave it flagged
        setIsSending(false);
        return false;
      }
    },
    [activeConversationId, token, onConversationCreated, onAssistantSpoke, scrollToBottom]
  );

  return {
    messages,
    isLoadingMessages,
    isSending,
    error,
    sendMessage,
    messagesEndRef,
    scrollToBottom,
  };
}
