import type { VercelRequest, VercelResponse } from '../types';
import { authenticateRequest, getSupabaseServerClient } from '../lib/supabaseServer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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

  const client = getSupabaseServerClient();
  if (!client) {
    // Demo mode fallback list
    return res.status(200).json({
      success: true,
      conversations: [
        {
          id: 'demo-conv-1',
          user_id: user.id,
          title: 'Welcome to MyVoice',
          language: 'en-US',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    });
  }

  if (req.method === 'GET') {
    try {
      const { data: conversations, error } = await client
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({ success: false, error: 'Failed to retrieve conversations.' });
      }

      return res.status(200).json({
        success: true,
        conversations: conversations || [],
      });
    } catch (err: any) {
      console.error('Unexpected error in GET /api/conversations:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const title = body.title?.trim() || 'New Conversation';
      const language = body.language || 'en-US';

      const { data: conversation, error } = await client
        .from('conversations')
        .insert({
          user_id: user.id,
          title,
          language,
        })
        .select()
        .single();

      if (error || !conversation) {
        console.error('Error creating conversation:', error);
        return res.status(500).json({ success: false, error: 'Failed to create conversation.' });
      }

      return res.status(201).json({
        success: true,
        conversation,
      });
    } catch (err: any) {
      console.error('Unexpected error in POST /api/conversations:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
