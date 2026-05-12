/**
 * OAuth callback handler.
 *
 * Supabase redirects the browser here after a successful provider sign-in,
 * with `?code=...`. We exchange the code for a session, which sets HTTP-only
 * cookies, then redirect to the portal.
 *
 * Configured in:
 *   - Supabase Authentication > URL Configuration > Site URL + Redirect URLs
 *     (must include https://www.818capitalpartners.com/auth/callback)
 *   - The provider console (Google Cloud, etc.) — the redirect URI registered
 *     there is still https://<project>.supabase.co/auth/v1/callback (Supabase
 *     proxies us); this handler is where Supabase forwards the user after.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/portal';

  if (!code) {
    return NextResponse.redirect(`${origin}/portal/sign-in?error=missing_code`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/portal/sign-in?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
