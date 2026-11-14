import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { IncomingMessage } from 'http';
import { isValidUUID } from './uuid.ts';

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
  const client = getSupabaseServerClient();
  const authHeader = req.headers.authorization;

  // If in local/demo mode without Supabase server credentials
  if (!client) {
    return {
      id: DEMO_USER_UUID,
      email: 'guest@myvoice.ai',
      app_metadata: {},
      user_metadata: { full_name: 'Demo User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }

  // Permit mock demo token when Supabase is configured but user is in demo mode
  if (token === 'mock-demo-token' || token.startsWith('demo-')) {
    return {
      id: DEMO_USER_UUID,
      email: 'guest@myvoice.ai',
      app_metadata: {},
      user_metadata: { full_name: 'Demo User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
  }

  try {
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) {
      // In case client is connected but user is testing in guest mode
      if (token === 'mock-demo-token' || token.startsWith('demo-')) {
        return {
          id: DEMO_USER_UUID,
          email: 'guest@myvoice.ai',
          app_metadata: {},
          user_metadata: { full_name: 'Demo User' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;
      }
      return null;
    }

    // Verify user ID is a valid UUID
    if (!isValidUUID(user.id)) {
      console.error('Retrieved user has non-UUID ID:', user.id);
      return null;
    }

    return user;
  } catch (err) {
    console.error('Auth verification error:', err);
    return null;
  }
}
