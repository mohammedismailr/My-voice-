import { z } from 'zod';
import type { VercelRequest, VercelResponse } from './types.ts';
import { authenticateRequest, getSupabaseServerClient } from './lib/supabaseServer.ts';
import { generateGeminiResponse, type HistoryTurn } from './lib/gemini.ts';
import { generateUUID, isValidUUID } from './lib/uuid.ts';
import { demoStore } from './lib/demoStore.ts';

// Safe validation schema: pre-processes conversationId and rejects invalid payload formats gracefully
const chatRequestSchema = z.object({
  conversationId: z
    .unknown()
    .transform((val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'pending') {
          return undefined;
        }
        return trimmed;
      }
      return undefined;
    })
    .optional(),
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters'),
  language: z.enum(['en-US', 'hi-IN', 'kn-IN']).default('en-US'),
  inputMode: z.enum(['text', 'voice']).default('text'),
});

function parseBody(req: VercelRequest): any {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body || {};
}

function generateCleanTitle(text: string): string {
  const clean = text.replace(/[\r\n]+/g, ' ').trim();
  if (clean.length <= 40) return clean;
  const slice = clean.slice(0, 40);
  const lastSpace = slice.lastIndexOf(' ');
  return lastSpace > 20 ? `${slice.slice(0, lastSpace)}...` : `${slice}...`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    // 1. Authenticate user
    const user = await authenticateRequest(req);
    if (!user) {
      console.warn('[API/Chat] Unauthorized request attempt');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Your session has expired. Please sign in again.',
      });
    }

    // 2. Validate request body with Zod
    const rawBody = parseBody(req);
    const parseResult = chatRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]?.message || 'Invalid request payload';
      console.warn('[API/Chat] Request validation error:', firstIssue);
      return res.status(400).json({ success: false, error: firstIssue });
    }

    const { conversationId: rawConvId, message, language, inputMode } = parseResult.data;
    const client = getSupabaseServerClient();

    // 3. Resolve Conversation UUID:
    // Ensure we always have a valid RFC 4122 v4 UUID
    let targetConvId: string;
    let isNewConversation = false;

    if (rawConvId && isValidUUID(rawConvId)) {
      targetConvId = rawConvId;
    } else {
      targetConvId = generateUUID();
      isNewConversation = true;
    }

    // =========================================================================
    // IN-MEMORY / DEMO MODE (When Supabase is not configured)
    // =========================================================================
    if (!client) {
      console.log(`[API/Chat Demo Mode] Conversation ID: ${targetConvId}, User: ${user.id}`);

      // Ensure conversation exists in demo store
      let conv = demoStore.getConversation(targetConvId);
      if (!conv || isNewConversation) {
        const title = generateCleanTitle(message);
        conv = demoStore.createConversation(user.id, title, language, targetConvId);
      }

      // Save user message in demo store
      const userMessageRecord = demoStore.addMessage(
        targetConvId,
        'user',
        message,
        inputMode,
        language,
        generateUUID()
      );

      // Retrieve recent context from demo store
      const historyTurns: HistoryTurn[] = [];
      const pastMessages = demoStore.getMessages(targetConvId);
      // Take up to 20 messages before current
      const chronological = pastMessages.slice(0, -1).slice(-20);
      for (const m of chronological) {
        historyTurns.push({ role: m.role, content: m.content });
      }

      // Generate AI response with Gemini (or fallback if key not configured)
      let aiText = '';
      try {
        aiText = await generateGeminiResponse(message, historyTurns, language);
      } catch (geminiErr: any) {
        console.warn('[API/Chat Demo Mode] Gemini API:', geminiErr.message);
        aiText = `Hello! I received your message: "${message}". (To connect live Gemini and save to cloud, ensure GEMINI_API_KEY is configured in your .env file).`;
      }

      // Save assistant message in demo store
      const assistantMessageRecord = demoStore.addMessage(
        targetConvId,
        'assistant',
        aiText,
        inputMode,
        language,
        generateUUID()
      );

      return res.status(200).json({
        success: true,
        conversationId: targetConvId,
        userMessage: userMessageRecord,
        assistantMessage: assistantMessageRecord,
      });
    }

    // =========================================================================
    // PRODUCTION MODE (Supabase Connected)
    // =========================================================================
    // Check if conversation already exists in database
    let existingConversation = null;
    if (!isNewConversation) {
      const { data: conv, error: convError } = await client
        .from('conversations')
        .select('id, user_id, language')
        .eq('id', targetConvId)
        .maybeSingle();

      if (!convError && conv) {
        if (conv.user_id !== user.id) {
          return res.status(403).json({ success: false, error: 'Access denied: You do not own this conversation.' });
        }
        existingConversation = conv;
      }
    }

    // If conversation doesn't exist yet in Supabase, create it now with valid targetConvId
    if (!existingConversation) {
      const title = generateCleanTitle(message);
      const { data: newConv, error: createError } = await client
        .from('conversations')
        .insert({
          id: targetConvId,
          user_id: user.id,
          title,
          language,
        })
        .select()
        .single();

      if (createError || !newConv) {
        console.error('[API/Chat] Failed to create conversation in Supabase:', createError);
        return res.status(500).json({ success: false, error: 'Failed to create conversation.' });
      }
    }

    // Save User Message
    const userMsgId = generateUUID();
    const { data: userMessageRecord, error: userMsgError } = await client
      .from('messages')
      .insert({
        id: userMsgId,
        conversation_id: targetConvId,
        role: 'user',
        content: message,
        input_mode: inputMode,
        language,
      })
      .select()
      .single();

    if (userMsgError || !userMessageRecord) {
      console.error('[API/Chat] Failed to save user message:', userMsgError);
      return res.status(500).json({ success: false, error: 'Failed to save your message.' });
    }

    // Retrieve Context (Recent message window, up to 20 messages)
    const { data: recentMessages, error: historyError } = await client
      .from('messages')
      .select('role, content')
      .eq('conversation_id', targetConvId)
      .order('created_at', { ascending: false })
      .limit(20);

    const history: HistoryTurn[] = [];
    if (!historyError && recentMessages) {
      // Exclude current message and reverse to chronological
      const chronological = recentMessages.reverse().slice(0, -1);
      for (const m of chronological) {
        if (m.role === 'user' || m.role === 'assistant') {
          history.push({ role: m.role, content: m.content });
        }
      }
    }

    // Generate Gemini Response
    let assistantReply = '';
    try {
      assistantReply = await generateGeminiResponse(message, history, language);
    } catch (geminiError: any) {
      console.error('[API/Chat] Gemini Generation Error:', geminiError);
      return res.status(502).json({
        success: false,
        error: geminiError?.message || 'AI response could not be generated. Please try again.',
      });
    }

    // Save Assistant Message (via privileged server client)
    const assistantMsgId = generateUUID();
    const { data: assistantMessageRecord, error: assistantMsgError } = await client
      .from('messages')
      .insert({
        id: assistantMsgId,
        conversation_id: targetConvId,
        role: 'assistant',
        content: assistantReply,
        input_mode: inputMode,
        language,
      })
      .select()
      .single();

    if (assistantMsgError || !assistantMessageRecord) {
      console.error('[API/Chat] Failed to persist assistant message:', assistantMsgError);
      return res.status(500).json({ success: false, error: 'Failed to record AI response.' });
    }

    // Update conversation timestamp
    await client
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', targetConvId);

    // Return response
    return res.status(200).json({
      success: true,
      conversationId: targetConvId,
      userMessage: userMessageRecord,
      assistantMessage: assistantMessageRecord,
    });
  } catch (error: any) {
    console.error('[API/Chat] Unexpected server error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your request.',
    });
  }
}
