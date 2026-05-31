import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  // ── 认证 ──────────────────────────────────────────────
  // 旧实现用一个全局共享的 anon 客户端裸查数据，任何人（含未登录者）
  // 直接 GET /api/account-stats 即可拿到全公司的余额/消费/充值汇总。
  // 这里基于请求 Cookie 中的会话做认证：未登录 → 401。
  // 同时用「请求作用域」的客户端，避免跨请求共享 Supabase 实例。
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      // Route Handler 中无需把刷新后的 Cookie 写回响应，留空即可
      setAll() {},
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    // 并行获取充值和消费记录
    const [rechargeResult, expenseResult] = await Promise.all([
      supabase.from('recharge_records').select('amount, status'),
      supabase.from('expense_records').select('points, status'),
    ]);

    // 计算累计充值（只计算成功的）
    const totalRecharge = (rechargeResult.data || [])
      .filter(r => r.status === '成功')
      .reduce((sum, r) => sum + Number(r.amount), 0);

    // 计算累计消费（points 是负数，取绝对值）
    const totalExpense = Math.abs(
      (expenseResult.data || [])
        .filter(r => r.status === '成功')
        .reduce((sum, r) => sum + Number(r.points), 0)
    );

    // 账户余额 = 累计充值 - 累计消费
    const balance = totalRecharge - totalExpense;

    return NextResponse.json({
      balance,
      totalExpense,
      totalRecharge,
    });
  } catch (error) {
    console.error('Error fetching account stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account stats' },
      { status: 500 }
    );
  }
}
