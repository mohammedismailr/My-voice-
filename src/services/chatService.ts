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
      cleanMessage = 'AI Server is currently initializing or encountered a temporary function error. Please retry.';
    } else if (cleanMessage.length > 200 || cleanMessage.startsWith('<')) {
      cleanMessage = `Server communication error (${response.status}): ${response.statusText || 'Please try again.'}`;
    }
    throw new Error(cleanMessage || `Server returned error (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(data?.error || `Server returned error (${response.status})`);
  }

  return data;
}
