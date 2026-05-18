import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
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
