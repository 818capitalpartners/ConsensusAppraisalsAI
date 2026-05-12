/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Uses cookies() from next/headers — session round-trips through HTTP-only
 * cookies set by /auth/callback and refreshed by middleware.
 *
 * Cookie writes inside Server Components will throw — Next.js disallows it.
 * The try/catch on `setAll` lets read-only Server Components work; the actual
 * cookie writes happen in middleware (session refresh) and the auth/callback
 * route handler (session establish).
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can't set cookies. Safe to ignore — middleware
            // will refresh the session on the next request.
          }
        },
      },
    },
  );
}
