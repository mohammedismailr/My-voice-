import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message, InputMode, SupportedLanguage } from '../types';
import { sendChatMessage } from '../services/chatService';
import { fetchConversationDetails } from '../services/conversationService';
import { useAuth } from './useAuth';
import { generateConversationTitle } from '../utils';
import { generateUUID, isValidUUID } from '../utils/uuid';

interface UseChatProps {
  activeConversationId: string | null;
  onConversationCreated?: (conv: { id: string; title: string; language: SupportedLanguage }) => void;
  onAssistantSpoke?: (text: string, language: SupportedLanguage) => void;
}

interface FailedMessageState {
  content: string;
  language: SupportedLanguage;
  inputMode: InputMode;
  model?: string;
  companionId?: string;
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
  // Ref to track conversation IDs that were just created locally to prevent redundant reload
  const justCreatedConvIdRef = useRef<string | null>(null);
  const lastFailedMessageRef = useRef<FailedMessageState | null>(null);

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

    // If this conversation was just initialized by sendMessage, skip redundant fetch
    if (justCreatedConvIdRef.current === activeConversationId) {
      justCreatedConvIdRef.current = null;
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
      inputMode: InputMode = 'text',
      model?: string,
      companionId?: string
    ): Promise<boolean> => {
      const cleanContent = content.trim();
      if (!cleanContent) return false;

      setIsSending(true);
      setError(null);

      // Ensure valid target UUID v4 for the conversation
      const targetConvId =
        activeConversationId && isValidUUID(activeConversationId)
          ? activeConversationId
          : generateUUID();

      // Create optimistic user message with valid UUID v4
      const userMsgId = generateUUID();
      const optimisticUserMsg: Message = {
        id: userMsgId,
        conversation_id: targetConvId,
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
            conversationId: targetConvId,
            message: cleanContent,
            language,
            inputMode,
            model,
            companionId,
          },
          token || undefined
        );

        if (!response.success) {
          throw new Error(response.error || 'Failed to get AI response');
        }

        lastFailedMessageRef.current = null;
        const confirmedConvId = response.conversationId || targetConvId;

        // If a new conversation was created on the backend or locally
        if (confirmedConvId !== activeConversationId) {
          justCreatedConvIdRef.current = confirmedConvId;
          const generatedTitle = generateConversationTitle(cleanContent);
          onConversationCreated?.({
            id: confirmedConvId,
            title: generatedTitle,
            language,
          });
        }

        // Replace optimistic user message with confirmed messages from backend
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== userMsgId);
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
        lastFailedMessageRef.current = {
          content: cleanContent,
          language,
          inputMode,
          model,
          companionId,
        };
        setError(err.message || 'AI response could not be generated. Please try again.');
        setIsSending(false);
        return false;
      }
    },
    [activeConversationId, token, onConversationCreated, onAssistantSpoke, scrollToBottom]
  );

  const retryLastMessage = useCallback(async (): Promise<boolean> => {
    if (!lastFailedMessageRef.current) return false;
    const { content, language, inputMode, model, companionId } = lastFailedMessageRef.current;
    return sendMessage(content, language, inputMode, model, companionId);
  }, [sendMessage]);

  return {
    messages,
    isLoadingMessages,
    isSending,
    error,
    sendMessage,
    retryLastMessage,
    hasFailedMessage: Boolean(lastFailedMessageRef.current),
    messagesEndRef,
    scrollToBottom,
  };
}
