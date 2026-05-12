/**
 * Supabase session refresh for Next.js middleware.
 *
 * Without this, the user's auth session expires every hour and they get
 * silently signed out. Called from src/middleware.ts on every request,
 * which forwards the freshly-set cookies in the response.
 */

import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the session — this triggers a refresh if the access token is near
  // expiry, and propagates new cookies via setAll above.
  await supabase.auth.getUser();

  return response;
}
