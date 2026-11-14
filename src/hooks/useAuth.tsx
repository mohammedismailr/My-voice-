import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { SupportedLanguage, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName?: string, language?: SupportedLanguage) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateLanguagePreference: (lang: SupportedLanguage) => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'myvoice_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check demo user from local storage if Supabase is not configured
  useEffect(() => {
    if (!isSupabaseConfigured) {
      const storedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          setUser(parsed.user);
          setProfile(parsed.profile);
        } catch {
          // invalid stored demo
        }
      }
      setIsLoading(false);
      return;
    }

    // Initialize real Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string) {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.warn('Could not load profile:', err);
    }
  }

  const token = session?.access_token || (user ? 'mock-demo-token' : null);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Demo authentication
      const demoUser: User = {
        id: 'demo-user-id',
        email,
        app_metadata: {},
        user_metadata: { full_name: email.split('@')[0] || 'Demo User' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      const demoProfile: UserProfile = {
        id: 'demo-user-id',
        display_name: email.split('@')[0] || 'Demo User',
        preferred_language: 'en-US',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
      setUser(demoUser);
      setProfile(demoProfile);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during sign in.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
    language: SupportedLanguage = 'en-US'
  ) => {
    if (!isSupabaseConfigured) {
      const demoUser: User = {
        id: 'demo-user-id',
        email,
        app_metadata: {},
        user_metadata: { full_name: displayName || email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      const demoProfile: UserProfile = {
        id: 'demo-user-id',
        display_name: displayName || email.split('@')[0] || 'Demo User',
        preferred_language: language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
      setUser(demoUser);
      setProfile(demoProfile);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
            preferred_language: language,
          },
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during registration.' };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateLanguagePreference = async (lang: SupportedLanguage) => {
    if (profile) {
      setProfile({ ...profile, preferred_language: lang });
    }
    if (isSupabaseConfigured && user) {
      await supabase.from('profiles').update({ preferred_language: lang }).eq('id', user.id);
    } else {
      const storedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          parsed.profile.preferred_language = lang;
          localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
    }
  };

  const enterDemoMode = () => {
    const demoUser: User = {
      id: 'demo-guest-id',
      email: 'guest@myvoice.ai',
      app_metadata: {},
      user_metadata: { full_name: 'Guest Explorer' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    const demoProfile: UserProfile = {
      id: 'demo-guest-id',
      display_name: 'Guest Explorer',
      preferred_language: 'en-US',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
    setUser(demoUser);
    setProfile(demoProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        token,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        updateLanguagePreference,
        enterDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
