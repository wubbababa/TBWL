import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
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

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const users = data.users.map(u => ({
    id: u.id,
    email: u.email,
    display_name: (u.user_metadata as { display_name?: string } | null)?.display_name || '',
    role: (u.app_metadata as { role?: string } | null)?.role || 'user',
    banned: u.banned_until ? new Date(u.banned_until) > new Date() : false,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }));

  return NextResponse.json({ users });
}
