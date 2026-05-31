import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This route uses the service_role key — it MUST stay server-side only.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  // 1. Verify the caller is an authenticated user (basic session check via anon client)
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const callerToken = authHeader.slice(7);
  const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(callerToken);
  if (callerError || !caller) {
    return NextResponse.json({ error: '无效的会话，请重新登录' }, { status: 401 });
  }

  // 1b. 鉴权：调用者必须是管理员。
  //
  // 旧实现只校验「是否登录」，任何登录用户都能创建新账号 —— 等于人人都是管理员。
  // 这里要求调用者的 app_metadata.role === 'admin' 才放行。
  //
  // 为什么用 app_metadata 而不是 user_metadata：
  //   - app_metadata 只能由 service_role / Admin API 写入，普通用户改不了；
  //   - user_metadata 用户自己就能通过 auth.updateUser() 修改，会被用来提权。
  //
  // 设置管理员（在 Supabase SQL Editor 或通过 Admin API 执行其一）：
  //   - SQL: UPDATE auth.users
  //          SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
  //          WHERE email = 'admin@example.com';
  //   - 或: supabase.auth.admin.updateUserById(id, { app_metadata: { role: 'admin' } })
  const callerRole = (caller.app_metadata as { role?: string } | null)?.role;
  if (callerRole !== 'admin') {
    return NextResponse.json({ error: '无权操作：仅管理员可创建账号' }, { status: 403 });
  }

  // 2. Parse body
  let body: { email?: string; password?: string; display_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const { email, password, display_name } = body;

  if (!email || !password) {
    return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码至少需要 6 位' }, { status: 400 });
  }

  // 3. Create the user via Admin API
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email verification for internal accounts
    user_metadata: display_name ? { display_name } : undefined,
  });

  if (error) {
    // Surface Supabase error messages in Chinese where possible
    const msg = error.message.includes('already registered')
      ? '该邮箱已被注册'
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    user: { id: data.user.id, email: data.user.email },
  });
}
