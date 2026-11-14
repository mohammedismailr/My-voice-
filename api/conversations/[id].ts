import type { VercelRequest, VercelResponse } from '../types';
import { authenticateRequest, getSupabaseServerClient } from '../lib/supabaseServer';

function extractId(req: VercelRequest): string {
  if (req.query?.id) {
    return Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  }
  const urlParts = (req.url || '').split('?')[0].split('/');
  return urlParts[urlParts.length - 1] || '';
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

  const client = getSupabaseServerClient();
  if (!client) {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        conversation: {
          id: conversationId,
          user_id: user.id,
          title: 'Demo Conversation',
          language: 'en-US',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        messages: [],
      });
    }
    if (req.method === 'DELETE') {
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 1. Verify ownership of the conversation
  const { data: conversation, error: convError } = await client
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    return res.status(404).json({ success: false, error: 'Conversation not found.' });
  }

  if (conversation.user_id !== user.id) {
    return res.status(403).json({ success: false, error: 'Forbidden: You do not own this conversation.' });
  }

  // 2. GET messages
  if (req.method === 'GET') {
    try {
      const { data: messages, error: msgError } = await client
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error('Error fetching messages:', msgError);
        return res.status(500).json({ success: false, error: 'Failed to retrieve conversation messages.' });
      }

      return res.status(200).json({
        success: true,
        conversation,
        messages: messages || [],
      });
    } catch (err: any) {
      console.error('Unexpected error in GET conversation:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // 3. DELETE conversation
  if (req.method === 'DELETE') {
    try {
      const { error: deleteError } = await client
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (deleteError) {
        console.error('Error deleting conversation:', deleteError);
        return res.status(500).json({ success: false, error: 'Failed to delete conversation.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully.',
      });
    } catch (err: any) {
      console.error('Unexpected error in DELETE conversation:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
