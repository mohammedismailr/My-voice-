import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import type { IncomingMessage } from 'http';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('your-service-role')) {
    return null;
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

/**
 * Extracts Bearer token from incoming HTTP Authorization header
 * and validates the user session using Supabase Auth.
 */
export async function authenticateRequest(req: IncomingMessage): Promise<User | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  // If in local mock mode without Supabase keys, permit mock user
  const client = getSupabaseServerClient();
  if (!client) {
    if (token === 'mock-demo-token' || token.startsWith('demo-')) {
      return {
        id: 'demo-user-id',
        app_metadata: {},
        user_metadata: { full_name: 'Demo User' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
    }
    return null;
  }

  try {
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (err) {
    console.error('Auth verification error:', err);
    return null;
  }
}
