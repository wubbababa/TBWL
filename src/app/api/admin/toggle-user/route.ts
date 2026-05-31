import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
  if (callerError || !caller) {
    return NextResponse.json({ error: '无效的会话' }, { status: 401 });
  }

  const callerRole = (caller.app_metadata as { role?: string } | null)?.role;
  if (callerRole !== 'admin') {
    return NextResponse.json({ error: '无权操作' }, { status: 403 });
  }

  let body: { user_id?: string; banned?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const { user_id, banned } = body;
  if (!user_id || typeof banned !== 'boolean') {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }

  if (user_id === caller.id) {
    return NextResponse.json({ error: '不能禁用自己的账号' }, { status: 400 });
  }

  const ban_duration = banned ? '876000h' : 'none';
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { ban_duration });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
