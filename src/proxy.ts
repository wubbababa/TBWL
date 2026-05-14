import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supabase stores the session in a cookie named sb-<project-ref>-auth-token.
// The project ref is derived from NEXT_PUBLIC_SUPABASE_URL at build time.
// We match any cookie that starts with "sb-" and ends with "-auth-token".
function hasSupabaseSession(request: NextRequest): boolean {
  const cookies = request.cookies.getAll();
  return cookies.some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token') && c.value.length > 0
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page through unconditionally
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // If no session cookie is present, redirect to /login
  if (!hasSupabaseSession(request)) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico   (browser icon)
     * - public folder files (svg, png, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg$|.*\\.png$).*)',
  ],
};
