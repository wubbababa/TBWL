import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * 路由守卫（Next.js 16 Proxy，原 Middleware）。
 *
 * 旧实现仅检查请求里是否存在名为 `sb-*-auth-token` 的 Cookie，
 * 但「Cookie 存在」≠「Cookie 有效」：任何人都能手动伪造一个
 * 名字匹配、值非空的 Cookie 来骗过守卫。
 *
 * 这里升级为「真实 token 校验」：用 @supabase/ssr 的 createServerClient
 * 读取请求 Cookie 中的会话，并调用 supabase.auth.getUser()。
 * getUser() 会把 JWT 发往 Supabase Auth 服务端做签名与有效期校验，
 * 只有返回了合法 user 才放行；伪造或过期的 token 一律被拒。
 *
 * 同时通过 getAll/setAll 把刷新后的会话 Cookie 写回响应，
 * 避免出现随机登出 / 会话提前失效等难以排查的问题。
 *
 * 注意：Proxy 只是「乐观检查」的第一道防线。真正的数据访问控制
 * 仍由数据库层 RLS（见 supabase/fix_orders_rls.sql）与各 API 路由内
 * 的认证/鉴权共同保证 —— 切勿只依赖 Proxy。
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 登录页无条件放行
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // 后续可能需要把刷新后的 Cookie 写回这个响应对象
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 环境变量缺失时，按未认证处理，重定向到登录页（避免裸奔）
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // 先写回 request，再用更新后的 request 重建 response，
        // 最后把 Cookie 同步到 response —— Supabase SSR 推荐写法。
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

  // 真实校验：向 Supabase 验证 JWT 签名与有效期
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
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
