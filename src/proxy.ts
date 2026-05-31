import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * 路由守卫（Next.js 16 Proxy）。
 *
 * 优化策略：
 * 1. 公开路径（/login, /api/...）直接放行，不做认证
 * 2. 快速检查：先看 cookie 是否存在，不存在直接重定向（避免创建 Supabase 客户端）
 * 3. 完整校验：调用 getUser() 验证 JWT 签名与有效期
 */

/** 无需认证的路径前缀 */
const PUBLIC_PATHS = ['/login', '/api/'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));
}

/** 快速检查是否存在 Supabase auth cookie（不验证有效性） */
function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路径直接放行
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 快速路径：无 auth cookie 直接重定向，避免创建 Supabase 客户端
  if (!hasAuthCookie(request)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // 完整校验：向 Supabase 验证 JWT
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg$|.*\\.png$).*)',
  ],
};
