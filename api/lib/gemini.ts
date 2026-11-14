import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_INSTRUCTION = `You are MyVoice, a friendly, intelligent and multilingual conversational AI assistant. Understand the user's intent and provide helpful, accurate and natural answers. Support English, Hindi and Kannada. Respond in the language used by the user or their selected preference. Maintain relevant context within the current conversation. Be concise when appropriate and explain concepts clearly when needed. Never claim to perform actions you have not performed.

Formatting Guidelines:
- Use clean Markdown formatting when helpful (lists, bold highlights, code blocks).
- When responding in Hindi or Kannada, write naturally in their native scripts (Devanagari for Hindi, Kannada script for Kannada).
- Keep voice-oriented responses natural to listen to.`;

export interface HistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateGeminiResponse(
  message: string,
  history: HistoryTurn[] = [],
  preferredLanguage?: string,
  requestedModel?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your-gemini-api-key')) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set it in your environment variables.');
  }

  const configuredModel = requestedModel || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const genAI = new GoogleGenerativeAI(apiKey);

  // Model fallback list if primary encounters temporary high demand (HTTP 503) or 404
  const candidateModels = Array.from(
    new Set([
      configuredModel,
      'gemini-3.5-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ])
  );

  // Convert history turns to Gemini's format: { role: 'user' | 'model', parts: [{ text }] }
  const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const turn of history) {
    if (!turn.content || turn.content.trim().length === 0) continue;
    const role = turn.role === 'assistant' ? 'model' : 'user';

    // Skip consecutive same roles to satisfy Gemini API constraints
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
      continue;
    }

    formattedHistory.push({
      role,
      parts: [{ text: turn.content }],
    });
  }

  // Ensure first turn in history is user if history is not empty
  while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
    formattedHistory.shift();
  }

  // Append language prompt reminder if language is explicitly set
  let promptToSend = message;
  if (preferredLanguage === 'hi-IN') {
    promptToSend = `[User preferred language: Hindi / हिन्दी. Please respond in Hindi.]\n\n${message}`;
  } else if (preferredLanguage === 'kn-IN') {
    promptToSend = `[User preferred language: Kannada / ಕನ್ನಡ. Please respond in Kannada.]\n\n${message}`;
  }

  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(promptToSend);
      const response = await result.response;
      const text = response.text();

      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err: any) {
      console.warn(`[Gemini] Model ${modelName} failed (${err.message}). Trying fallback...`);
      lastError = err;
      // Continue to next candidate model if 503 or 404
    }
  }

  throw lastError || new Error('All Gemini model candidates failed to generate a response.');
}
