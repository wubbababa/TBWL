'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

/**
 * Browser-side Supabase client.
 * Uses @supabase/ssr's createBrowserClient which persists the session
 * in cookies (in addition to localStorage), so the server-side proxy.ts
 * guard can read the auth cookie from incoming requests.
 */
export const supabase = createBrowserClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
