import { z } from 'zod';
import type { VercelRequest, VercelResponse } from './types';
import { authenticateRequest, getSupabaseServerClient } from './lib/supabaseServer';
import { generateGeminiResponse, type HistoryTurn } from './lib/gemini';

const chatRequestSchema = z.object({
  conversationId: z.string().uuid().optional().nullable(),
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message cannot exceed 4000 characters'),
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
      return res.status(400).json({ success: false, error: firstIssue });
    }

    const { conversationId: requestedConvId, message, language, inputMode } = parseResult.data;
    const client = getSupabaseServerClient();

    // In demo/mock environment if Supabase is unconfigured
    if (!client) {
      // If Gemini is configured, still generate real Gemini response!
      let aiText = '';
      try {
        aiText = await generateGeminiResponse(message, [], language);
      } catch (geminiErr: any) {
        aiText = `[Demo Mode] Gemini response: I heard "${message}". (Note: configure GEMINI_API_KEY and SUPABASE_SERVICE_ROLE_KEY in .env for full persistence).`;
      }

      const activeConvId = requestedConvId || 'demo-conv-1';
      return res.status(200).json({
        success: true,
        conversationId: activeConvId,
        userMessage: {
          id: `msg-${Date.now()}-u`,
          conversation_id: activeConvId,
          role: 'user',
          content: message,
          input_mode: inputMode,
          language,
          created_at: new Date().toISOString(),
        },
        assistantMessage: {
          id: `msg-${Date.now()}-a`,
          conversation_id: activeConvId,
          role: 'assistant',
          content: aiText,
          input_mode: inputMode,
          language,
          created_at: new Date().toISOString(),
        },
      });
    }

    // 3. Conversation resolution & ownership check
    let targetConvId = requestedConvId;

    if (targetConvId) {
      const { data: conv, error: convError } = await client
        .from('conversations')
        .select('id, user_id, language')
        .eq('id', targetConvId)
        .single();

      if (convError || !conv) {
        return res.status(404).json({ success: false, error: 'Conversation not found.' });
      }

      if (conv.user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'Access denied: You do not own this conversation.' });
      }
    } else {
      // Create new conversation
      const title = generateCleanTitle(message);
      const { data: newConv, error: createError } = await client
        .from('conversations')
        .insert({
          user_id: user.id,
          title,
          language,
        })
        .select()
        .single();

      if (createError || !newConv) {
        console.error('Failed to create conversation:', createError);
        return res.status(500).json({ success: false, error: 'Failed to create conversation.' });
      }

      targetConvId = newConv.id;
    }

    // 4. Save User Message
    const { data: userMessageRecord, error: userMsgError } = await client
      .from('messages')
      .insert({
        conversation_id: targetConvId,
        role: 'user',
        content: message,
        input_mode: inputMode,
        language,
      })
      .select()
      .single();

    if (userMsgError || !userMessageRecord) {
      console.error('Failed to save user message:', userMsgError);
      return res.status(500).json({ success: false, error: 'Failed to save your message.' });
    }

    // 5. Retrieve Context (Recent message window, up to 20 messages)
    const { data: recentMessages, error: historyError } = await client
      .from('messages')
      .select('role, content')
      .eq('conversation_id', targetConvId)
      .order('created_at', { ascending: false })
      .limit(20);

    const history: HistoryTurn[] = [];
    if (!historyError && recentMessages) {
      // Reverse to chronological order, excluding current user message which is appended as current prompt
      const chronological = recentMessages.reverse().slice(0, -1);
      for (const m of chronological) {
        if (m.role === 'user' || m.role === 'assistant') {
          history.push({ role: m.role, content: m.content });
        }
      }
    }

    // 6. Generate Gemini Response
    let assistantReply = '';
    try {
      assistantReply = await generateGeminiResponse(message, history, language);
    } catch (geminiError: any) {
      console.error('Gemini Generation Error:', geminiError);
      return res.status(502).json({
        success: false,
        error: geminiError?.message || 'AI response could not be generated. Please try again.',
      });
    }

    // 7. Save Assistant Message (via privileged server client)
    const { data: assistantMessageRecord, error: assistantMsgError } = await client
      .from('messages')
      .insert({
        conversation_id: targetConvId,
        role: 'assistant',
        content: assistantReply,
        input_mode: inputMode,
        language,
      })
      .select()
      .single();

    if (assistantMsgError || !assistantMessageRecord) {
      console.error('Failed to persist assistant message:', assistantMsgError);
      return res.status(500).json({ success: false, error: 'Failed to record AI response.' });
    }

    // Update conversation timestamp
    await client
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', targetConvId);

    // 8. Return response
    return res.status(200).json({
      success: true,
      conversationId: targetConvId,
      userMessage: userMessageRecord,
      assistantMessage: assistantMessageRecord,
    });
  } catch (error: any) {
    console.error('Unexpected server error in /api/chat:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your request.',
    });
  }
}
