import { NextRequest, NextResponse } from 'next/server';
import { updateSupabaseSession } from './lib/supabase/middleware';

/**
 * Single middleware combining two concerns:
 *
 * 1. HTTP Basic Auth gate for /command-center and /api/admin (admin tool).
 *    Credentials in Vercel env: COMMAND_CENTER_USER, COMMAND_CENTER_PASSWORD.
 *
 * 2. Supabase session cookie refresh for /portal and /auth (borrower/admin
 *    portal). Without this, sessions expire silently after an hour.
 *
 * Order matters: Basic Auth runs first because it short-circuits with 401
 * before we ever look at Supabase cookies.
 */

const BASIC_AUTH_PATHS = ['/command-center', '/api/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- 1. Basic Auth gate ---
  const needsBasicAuth = BASIC_AUTH_PATHS.some(
    p => pathname === p || pathname.startsWith(p + '/'),
  );

  if (needsBasicAuth) {
    const expectedUser = process.env.COMMAND_CENTER_USER || 'ravi';
    const expectedPass = process.env.COMMAND_CENTER_PASSWORD;

    if (!expectedPass) {
      return new NextResponse(
        'Auth not configured. Set COMMAND_CENTER_PASSWORD env var in Vercel.',
        { status: 503, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
      );
    }

    const auth = req.headers.get('authorization');
    let ok = false;
    if (auth) {
      const [scheme, encoded] = auth.split(' ');
      if (scheme === 'Basic' && encoded) {
        try {
          const decoded = atob(encoded);
          const sep = decoded.indexOf(':');
          if (sep > -1) {
            const user = decoded.slice(0, sep);
            const pass = decoded.slice(sep + 1);
            if (user === expectedUser && pass === expectedPass) ok = true;
          }
        } catch {
          // fall through to 401
        }
      }
    }

    if (!ok) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="818 Command Center", charset="UTF-8"',
          'X-Robots-Tag': 'noindex, nofollow',
          'Cache-Control': 'no-store',
        },
      });
    }
    return NextResponse.next();
  }

  // --- 2. Supabase session refresh for portal + auth routes ---
  if (pathname.startsWith('/portal') || pathname.startsWith('/auth')) {
    return updateSupabaseSession(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/command-center/:path*',
    '/api/admin/:path*',
    '/portal/:path*',
    '/auth/:path*',
  ],
};
