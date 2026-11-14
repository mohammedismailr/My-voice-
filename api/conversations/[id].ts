import type { VercelRequest, VercelResponse } from '../types';
import { authenticateRequest, getSupabaseServerClient } from '../lib/supabaseServer';
import { demoStore } from '../lib/demoStore';
import { isValidUUID } from '../lib/uuid';

function extractId(req: VercelRequest): string {
  if (req.query?.id) {
    const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    return rawId ? rawId.trim() : '';
  }
  const urlParts = (req.url || '').split('?')[0].split('/');
  return (urlParts[urlParts.length - 1] || '').trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = await authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please sign in.' });
  }

  const conversationId = extractId(req);
  if (!conversationId) {
    return res.status(400).json({ success: false, error: 'Missing conversation ID parameter.' });
  }

  // Gracefully handle non-UUID IDs without throwing database errors
  if (!isValidUUID(conversationId)) {
    return res.status(404).json({ success: false, error: 'Conversation not found.' });
  }

  const client = getSupabaseServerClient();

  // In demo / offline mode
  if (!client) {
    if (req.method === 'GET') {
      const conv = demoStore.getConversation(conversationId);
      if (!conv) {
        return res.status(404).json({ success: false, error: 'Conversation not found.' });
      }
      const messages = demoStore.getMessages(conversationId);
      return res.status(200).json({
        success: true,
        conversation: conv,
        messages,
      });
    }

    if (req.method === 'DELETE') {
      const success = demoStore.deleteConversation(conversationId);
      return res.status(200).json({ success });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Supabase connected mode
  if (req.method === 'GET') {
    try {
      const { data: conversation, error: convError } = await client
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();

      if (convError || !conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found.' });
      }

      if (conversation.user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not own this conversation.' });
      }

      const { data: messages, error: msgError } = await client
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error('[API/Conversations/:id] Error fetching messages:', msgError);
        return res.status(500).json({ success: false, error: 'Failed to retrieve conversation messages.' });
      }

      return res.status(200).json({
        success: true,
        conversation,
        messages: messages || [],
      });
    } catch (err: any) {
      console.error('[API/Conversations/:id] Unexpected error in GET:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { data: conversation, error: checkError } = await client
        .from('conversations')
        .select('id, user_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (checkError || !conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found.' });
      }

      if (conversation.user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not own this conversation.' });
      }

      const { error: deleteError } = await client
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (deleteError) {
        console.error('[API/Conversations/:id] Error deleting conversation:', deleteError);
        return res.status(500).json({ success: false, error: 'Failed to delete conversation.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully.',
      });
    } catch (err: any) {
      console.error('[API/Conversations/:id] Unexpected error in DELETE:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
