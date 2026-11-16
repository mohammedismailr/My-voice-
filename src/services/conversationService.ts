import type { Conversation, Message, SupportedLanguage } from '../types';

async function safeParseResponse(response: Response, defaultError: string): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    const rawText = await response.text();
    let cleanMessage = rawText.trim();
    if (cleanMessage.includes('FUNCTION_INVOCATION_FAILED')) {
      cleanMessage = 'Backend service is starting up. Please retry in a moment.';
    } else if (cleanMessage.length > 200 || cleanMessage.startsWith('<')) {
      cleanMessage = `${defaultError} (${response.status})`;
    }
    throw new Error(cleanMessage || defaultError);
  }

  if (!response.ok) {
    throw new Error(data?.error || `${defaultError} (${response.status})`);
  }

  return data;
}

export async function fetchConversations(accessToken?: string): Promise<Conversation[]> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch('/api/conversations', {
    method: 'GET',
    headers,
  });

  const data = await safeParseResponse(response, 'Failed to fetch conversations');
  return data?.conversations || [];
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

  const data = await safeParseResponse(response, 'Failed to create conversation');
  return data?.conversation;
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

  const data = await safeParseResponse(response, 'Failed to fetch conversation details');
  return {
    conversation: data?.conversation,
    messages: data?.messages || [],
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

  await safeParseResponse(response, 'Failed to delete conversation');
}
