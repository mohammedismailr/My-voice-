import type { ChatApiRequest, ChatApiResponse } from '../types';

const TIMEOUT_MS = 35000; // 35 seconds for mobile cellular and cold boot tolerance
const MAX_ATTEMPTS = 2;

async function executeChatRequest(
  payload: ChatApiRequest,
  accessToken?: string,
  attempt = 1
): Promise<ChatApiResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
      const cleanText = rawText.trim();

      // If Vercel or cloud provider returns a cold-start or temporary error, retry once
      const isTransientError =
        response.status >= 500 ||
        cleanText.includes('FUNCTION_INVOCATION_FAILED') ||
        cleanText.includes('GATEWAY_TIMEOUT') ||
        cleanText.includes('Endpoint request timed out');

      if (isTransientError && attempt < MAX_ATTEMPTS) {
        console.warn(`[ChatService] Attempt ${attempt} encountered transient server error (${response.status}). Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        return executeChatRequest(payload, accessToken, attempt + 1);
      }

      let userFriendlyMessage = 'The AI service is temporarily warming up. Please tap Retry.';
      if (cleanText.includes('FUNCTION_INVOCATION_FAILED')) {
        userFriendlyMessage = 'AI Server was initializing. Please try sending your message again.';
      } else if (cleanText.length > 0 && !cleanText.startsWith('<') && cleanText.length < 150) {
        userFriendlyMessage = cleanText;
      }
      throw new Error(userFriendlyMessage);
    }

    if (!response.ok) {
      const isTransient5xx = response.status >= 500 && response.status <= 504;
      if (isTransient5xx && attempt < MAX_ATTEMPTS) {
        console.warn(`[ChatService] Received HTTP ${response.status}. Retrying attempt ${attempt + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        return executeChatRequest(payload, accessToken, attempt + 1);
      }
      throw new Error(data?.error || `Server error (${response.status}). Please try again.`);
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      if (attempt < MAX_ATTEMPTS) {
        console.warn(`[ChatService] Request timed out on attempt ${attempt}. Retrying...`);
        return executeChatRequest(payload, accessToken, attempt + 1);
      }
      throw new Error('Connection timed out. Please check your internet connection and try again.');
    }

    // Network disconnection / offline
    if (
      (err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('Load failed')) &&
      attempt < MAX_ATTEMPTS
    ) {
      console.warn(`[ChatService] Network error on attempt ${attempt}. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return executeChatRequest(payload, accessToken, attempt + 1);
    }

    throw err;
  }
}

export async function sendChatMessage(
  payload: ChatApiRequest,
  accessToken?: string
): Promise<ChatApiResponse> {
  return executeChatRequest(payload, accessToken, 1);
}
