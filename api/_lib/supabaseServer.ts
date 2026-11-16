import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { IncomingMessage } from 'http';
import { isValidUUID } from './uuid';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Deterministic valid RFC 4122 v4 UUID for demo / guest fallback user
export const DEMO_USER_UUID = '00000000-0000-4000-8000-000000000001';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('your-service-role')) {
    return null;
  }

  try {
    cachedClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return cachedClient;
  } catch (err) {
    console.warn('[Supabase Server] Failed to initialize client:', err);
    return null;
  }
}

/**
 * Extracts Bearer token from incoming HTTP Authorization header
 * and validates the user session using Supabase Auth.
 * Falls back safely to Guest User so unauthenticated mobile visitors can chat.
 */
export async function authenticateRequest(req: IncomingMessage): Promise<User> {
  const guestUser: User = {
    id: DEMO_USER_UUID,
    email: 'guest@myvoice.ai',
    app_metadata: {},
    user_metadata: { full_name: 'Guest User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  const client = getSupabaseServerClient();
  const authHeader = req.headers.authorization;

  // If Supabase is not configured or no auth header is present, proceed as guest
  if (!client || !authHeader || !authHeader.startsWith('Bearer ')) {
    return guestUser;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token || token === 'undefined' || token === 'null' || token === 'mock-demo-token' || token.startsWith('demo-')) {
    return guestUser;
  }

  try {
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user || !isValidUUID(user.id)) {
      return guestUser;
    }
    return user;
  } catch (err) {
    console.warn('[API/Auth] Token verification fallback to guest:', err);
    return guestUser;
  }
}
