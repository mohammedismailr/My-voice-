import { GoogleGenerativeAI } from '@google/generative-ai';

export interface HistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiResponseResult {
  text: string;
  modelUsed: string;
}

/**
 * 3D Plush Companion Personas
 * Infuses authentic character voice, personality, and tone into responses.
 */
const COMPANION_PERSONAS: Record<string, string> = {
  'beige-mascot': `You are Mochi, a warm, calm, and soothing cream-colored plush bear companion wearing black studio headphones and rosy blushing cheeks.
Your personality is gentle, patient, comforting, and deeply attentive. You speak with a warm cadence, calm reassurance, and thoughtful clarity. You love keeping the user company and answering their questions with steady care.`,

  'blue-cloud': `You are Bubbles, a billowy sky-blue fluffy plush cloud companion wearing an elegant tilted French beret.
Your personality is cheerful, peaceful, curious, and poetic. You love gentle contemplation, creative storytelling, thoughtful reflections, and exploring new ideas with soft wonder.`,

  'pink-bunny': `You are Berry, an energetic and bubbly candy-pink plush bunny with pastel mint glowing headphones and perky ears.
Your personality is sunny, joyful, enthusiastic, and playful! You bring sparkling energy and positive encouragement to every conversation. You celebrate the user's curiosity and keep their spirits high!`,

  'yellow-triangle': `You are Pixel, a golden-yellow triangular plush with shiny round spectacles and a classy crimson bow tie.
Your personality is intelligent, analytical, witty, and sharp. You love solving problems, explaining complex math, science, or code in simple and fun terms, and cracking clever puzzles with a touch of playful humor.`,

  'purple-heart': `You are Nova, a vibrant cosmic-purple heart-shaped plush rocking retro heart sunglasses.
Your personality is visionary, bold, creative, and inspiring. You love music, art, poetry, creative writing, futuristic technology, and motivating the user to dream big and express themselves.`,
};

function buildSystemInstruction(companionId?: string): string {
  const persona = (companionId && COMPANION_PERSONAS[companionId]) || COMPANION_PERSONAS['beige-mascot'];

  return `${persona}

Core Conversational Guidelines:
1. Always stay in character as this adorable 3D plush AI companion.
2. Multilingual Fluency: Understand and speak in English, Hindi (हिन्दी using Devanagari script), and Kannada (ಕನ್ನಡ using Kannada script). Always match the user's language or preferred language naturally.
3. Natural Voice Rhythm: Keep spoken responses natural, pleasant to listen to, and well-phrased for text-to-speech.
4. Clean Markdown: Use concise bullet lists, bold text, or code blocks where helpful.
5. Truthfulness: Be helpful, accurate, and kind. Never claim actions you cannot perform.`;
}

/**
 * Categorizes raw API errors into clean, professional, user-friendly messages.
 */
export function categorizeAiError(err: any): string {
  const msg = err?.message || String(err || '');
  if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('401')) {
    return 'AI connection needs attention. Please check the API configuration.';
  }
  if (msg.includes('429') || msg.includes('quota') || msg.includes('Quota exceeded') || msg.includes('ResourceExhausted')) {
    return 'The AI service is temporarily busy. Please try again shortly.';
  }
  if (msg.includes('ENOTFOUND') || msg.includes('fetch failed') || msg.includes('Network') || msg.includes('ECONNREFUSED')) {
    return 'Unable to connect to the AI service. Check your internet connection.';
  }
  if (msg.includes('404') || msg.includes('not found') || msg.includes('no longer available')) {
    return 'This model is currently unavailable.';
  }
  if (msg.includes('503') || msg.includes('high demand') || msg.includes('temporarily unavailable')) {
    return 'The AI service is temporarily experiencing high demand. Please try again in a few moments.';
  }
  return 'Something went wrong while generating your response. Please try again.';
}

/**
 * Executes a single model chat request with a strict timeout.
 * Prevents hanging or long delays when Google API experiences 503 or spikes.
 */
async function callModelWithTimeout(
  genAI: GoogleGenerativeAI,
  modelName: string,
  systemInstruction: string,
  formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  prompt: string,
  timeoutMs = 6000
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });

  const chat = model.startChat({ history: formattedHistory });

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<string>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Model ${modelName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  const callPromise = (async () => {
    try {
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text().trim();
    } finally {
      if (timer) clearTimeout(timer);
    }
  })();

  return Promise.race([callPromise, timeoutPromise]);
}

/**
 * Primary AI generation engine with resilient candidate failover.
 */
export async function generateGeminiResponse(
  message: string,
  history: HistoryTurn[] = [],
  preferredLanguage?: string,
  requestedModel?: string,
  companionId?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your-gemini-api-key')) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set it in your environment variables.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const systemInstruction = buildSystemInstruction(companionId);

  // Candidate models in strict priority order:
  // 1. Requested model
  // 2. Verified ultra-fast model (gemini-3.5-flash-lite)
  // 3. Verified fast preview model (gemini-flash-lite-latest)
  // 4. Standard flash (gemini-3.5-flash)
  // 5. Reasoning flash (gemini-3.7-flash)
  const candidateModels = Array.from(
    new Set([
      requestedModel || 'gemini-3.5-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash',
      'gemini-1.5-flash',
      'gemini-3.7-flash',
      'gemini-1.5-pro',
    ].filter(Boolean))
  );

  // Convert history turns to Gemini format
  const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  for (const turn of history) {
    if (!turn.content || turn.content.trim().length === 0) continue;
    const role = turn.role === 'assistant' ? 'model' : 'user';

    // Skip consecutive identical roles
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
      continue;
    }

    formattedHistory.push({
      role,
      parts: [{ text: turn.content }],
    });
  }

  // Ensure first turn in history is user
  while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
    formattedHistory.shift();
  }

  // Format language prompt prefix
  let promptToSend = message;
  if (preferredLanguage === 'hi-IN') {
    promptToSend = `[User preferred language: Hindi / हिन्दी. Please respond in Hindi.]\n\n${message}`;
  } else if (preferredLanguage === 'kn-IN') {
    promptToSend = `[User preferred language: Kannada / ಕನ್ನಡ. Please respond in Kannada.]\n\n${message}`;
  }

  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    try {
      const text = await callModelWithTimeout(
        genAI,
        modelName,
        systemInstruction,
        formattedHistory,
        promptToSend,
        5500
      );

      if (text && text.length > 0) {
        return text;
      }
    } catch (err: any) {
      console.warn(`[Gemini] Candidate ${modelName} failed (${err.message}). Trying next candidate...`);
      lastError = err;
    }
  }

  // If all candidates failed, throw categorized error
  const friendlyError = categorizeAiError(lastError);
  throw new Error(friendlyError);
}
