/**
 * Supabase client for use in client components ('use client' files).
 * Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * Sessions are persisted via the cookies set by the /auth/callback handler
 * and refreshed by middleware. Don't put service-role key here.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Comma-separated list of OAuth providers to render in the SignIn UI.
// Matches Supabase provider IDs: google, azure, apple, facebook.
export function enabledOAuthProviders(): string[] {
  const raw = process.env.NEXT_PUBLIC_OAUTH_PROVIDERS || 'google';
  return raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}
