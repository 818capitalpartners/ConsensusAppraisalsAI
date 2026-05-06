import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth gate for internal admin routes.
 *
 * Currently protects:
 *   /command-center/*   - internal deal pipeline dashboard
 *
 * How it works:
 *   - HTTP Basic Auth challenge (browser pops native password dialog)
 *   - Credentials checked against env vars set in Vercel:
 *       COMMAND_CENTER_USER      (defaults to "ravi")
 *       COMMAND_CENTER_PASSWORD  (REQUIRED - fails closed if missing)
 *   - 401 returned with WWW-Authenticate header on any mismatch
 *   - X-Robots-Tag: noindex on the protected response so even leaked URLs
 *     do not enter search indexes
 *
 * To rotate the password: update the env var in Vercel project settings
 * -> Settings -> Environment Variables -> redeploy. Browser-cached creds
 * become invalid on next request.
 *
 * Note: this protects the *page route*. Static JS chunks under /_next/
 * are still cacheable by URL but contain only React component code,
 * not live API data. For full hardening, move /command-center page
 * to fetch its data from an authenticated /api/* route instead of
 * having it baked into the client bundle.
 */

const PROTECTED_PATHS = ['/command-center', '/api/admin'];

const PROPERTY_IMAGE_REPLACEMENTS: Record<string, string> = {
  // Replace generic aspirational house imagery with more grounded real-property visuals.
  'photo-1605276374104-dee2a0ed3cd6': 'photo-1460317442991-0ec209397118',
  'photo-1572120360610-d971b9d7767c': 'photo-1504307651254-35680f356dfd',
  'photo-1600596542815-ffad4c1539a9': 'photo-1499793983690-e29da59ef1c2',
  'photo-1570129477492-45c003edd2be': 'photo-1545324418-cc1a3fa10c00',
  'photo-1564013799919-ab600027ffc6': 'photo-1499793983690-e29da59ef1c2',
  'photo-1613490493576-7fde63acd811': 'photo-1460317442991-0ec209397118',
};

function rewritePropertyImage(req: NextRequest) {
  if (req.nextUrl.pathname !== '/_next/image') return null;

  const sourceUrl = req.nextUrl.searchParams.get('url');
  if (!sourceUrl) return null;

  const replacement = Object.entries(PROPERTY_IMAGE_REPLACEMENTS).find(([currentId]) =>
    sourceUrl.includes(currentId)
  );
  if (!replacement) return null;

  const [currentId, replacementId] = replacement;
  const nextUrl = req.nextUrl.clone();
  nextUrl.searchParams.set('url', sourceUrl.replace(currentId, replacementId));
  return NextResponse.rewrite(nextUrl);
}

export function middleware(req: NextRequest) {
  const propertyImageRewrite = rewritePropertyImage(req);
  if (propertyImageRewrite) return propertyImageRewrite;

  const { pathname } = req.nextUrl;

  // Only gate paths in PROTECTED_PATHS
  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (!isProtected) return NextResponse.next();

  const expectedUser = process.env.COMMAND_CENTER_USER || 'ravi';
  const expectedPass = process.env.COMMAND_CENTER_PASSWORD;

  // Fail closed if password not configured - better to lock yourself
  // out than to ship an open admin route.
  if (!expectedPass) {
    return new NextResponse(
      'Auth not configured. Set COMMAND_CENTER_PASSWORD env var in Vercel.',
      { status: 503, headers: { 'X-Robots-Tag': 'noindex, nofollow' } }
    );
  }

  const auth = req.headers.get('authorization');
  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      try {
        const decoded = atob(encoded);
        const sep = decoded.indexOf(':');
        if (sep > -1) {
          const user = decoded.slice(0, sep);
          const pass = decoded.slice(sep + 1);
          if (user === expectedUser && pass === expectedPass) {
            return NextResponse.next();
          }
        }
      } catch {
        // fall through to 401
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="818 Command Center", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    },
  });
}

export const config = {
  matcher: ['/_next/image', '/command-center/:path*', '/api/admin/:path*'],
};
