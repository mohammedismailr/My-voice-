import type { VercelRequest, VercelResponse } from './types.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-gemini-api-key')
  );

  const supabaseConfigured = Boolean(
    (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your-service-role')
  );

  return res.status(200).json({
    status: 'healthy',
    name: 'MyVoice AI Platform',
    version: '1.0.0',
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    languages: ['en-US', 'hi-IN', 'kn-IN'],
    services: {
      geminiConfigured,
      supabaseConfigured,
    },
    timestamp: new Date().toISOString(),
  });
}
