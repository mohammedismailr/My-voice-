import type { ChatApiRequest, ChatApiResponse } from '../types';

export async function sendChatMessage(
  payload: ChatApiRequest,
  accessToken?: string
): Promise<ChatApiResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server returned error (${response.status})`);
  }

  return data;
}
