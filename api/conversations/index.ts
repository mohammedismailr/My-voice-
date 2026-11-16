import type { VercelRequest, VercelResponse } from '../_types';
import { authenticateRequest, getSupabaseServerClient, DEMO_USER_UUID } from '../_lib/supabaseServer';
import { demoStore } from '../_lib/demoStore';
import { generateUUID, isValidUUID } from '../_lib/uuid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = await authenticateRequest(req);
  const client = getSupabaseServerClient();
  const isGuestOrDemo = !client || user.id === DEMO_USER_UUID;

  // In demo/guest mode
  if (isGuestOrDemo) {
    if (req.method === 'GET') {
      const conversations = demoStore.getConversations(user.id);
      return res.status(200).json({
        success: true,
        conversations,
      });
    }

    if (req.method === 'POST') {
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
        const title = body.title?.trim() || 'New Conversation';
        const language = body.language || 'en-US';
        const convId = body.id && isValidUUID(body.id) ? body.id : generateUUID();

        const conversation = demoStore.createConversation(user.id, title, language, convId);
        return res.status(201).json({
          success: true,
          conversation,
        });
      } catch (err: any) {
        console.error('[API/Conversations Demo] Error creating conversation:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Supabase connected mode
  if (req.method === 'GET') {
    try {
      const { data: conversations, error } = await client
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[API/Conversations] Error fetching conversations:', error);
        return res.status(500).json({ success: false, error: 'Failed to retrieve conversations.' });
      }

      return res.status(200).json({
        success: true,
        conversations: conversations || [],
      });
    } catch (err: any) {
      console.error('[API/Conversations] Unexpected error in GET:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const title = body.title?.trim() || 'New Conversation';
      const language = body.language || 'en-US';
      const convId = body.id && isValidUUID(body.id) ? body.id : generateUUID();

      const { data: conversation, error } = await client
        .from('conversations')
        .insert({
          id: convId,
          user_id: user.id,
          title,
          language,
        })
        .select()
        .single();

      if (error || !conversation) {
        console.error('[API/Conversations] Error creating conversation:', error);
        return res.status(500).json({ success: false, error: 'Failed to create conversation.' });
      }

      return res.status(201).json({
        success: true,
        conversation,
      });
    } catch (err: any) {
      console.error('[API/Conversations] Unexpected error in POST:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
