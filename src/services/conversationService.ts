import type { Conversation, Message, SupportedLanguage } from '../types';

export async function fetchConversations(accessToken?: string): Promise<Conversation[]> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch('/api/conversations', {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch conversations');
  }

  return data.conversations || [];
}

export async function createConversation(
  title: string,
  language: SupportedLanguage = 'en-US',
  accessToken?: string
): Promise<Conversation> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, language }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create conversation');
  }

  return data.conversation;
}

export async function fetchConversationDetails(
  id: string,
  accessToken?: string
): Promise<{ conversation: Conversation; messages: Message[] }> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`/api/conversations/${id}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch conversation details');
  }

  return {
    conversation: data.conversation,
    messages: data.messages || [],
  };
}

export async function deleteConversation(id: string, accessToken?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`/api/conversations/${id}`, {
    method: 'DELETE',
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete conversation');
  }
}
