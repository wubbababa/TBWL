// 为最近 7 天补充 order_profit 测试数据，使首页折线图有数据展示。
// 幂等：使用固定 order_number 前缀 SEED-PROFIT-7D-，重复运行先清理再插入。
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim();

const supabase = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'));

const PREFIX = 'SEED-PROFIT-7D-';

// 每天的实际收入波动值（CNY），共 7 天
const dailyActual = [180.5, 320.0, 95.25, 410.75, 260.0, 540.3, 305.6];

function buildRows() {
  const rows = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    d.setHours(12, 0, 0, 0); // 当天中午，避免时区跨日
    const actual = dailyActual[i];
    // 由实际收入反推一组合理的关联金额
    const orderIncome = Number((actual * 3.5).toFixed(2));
    rows.push({
      order_number: `${PREFIX}${i + 1}`,
      sales_amount: Number((actual * 12).toFixed(2)),
      paid_amount: Number((actual * 11).toFixed(2)),
      other_fees: Number((actual * 0.3).toFixed(2)),
      logistics_cost: Number((actual * 0.5).toFixed(2)),
      order_income: orderIncome,
      purchase_cost: Number((actual * 2.2).toFixed(2)),
      inventory_cost: Number((actual * 0.15).toFixed(2)),
      freight_cost: Number((actual * 0.35).toFixed(2)),
      actual_income: actual,
      created_at: d.toISOString(),
    });
  }
  return rows;
}

(async () => {
  // 清理旧的种子行（幂等）
  const { error: delErr } = await supabase
    .from('order_profit')
    .delete()
    .like('order_number', `${PREFIX}%`);
  if (delErr) {
    console.error('DELETE ERROR', delErr);
    return;
  }

  const rows = buildRows();
  const { data, error } = await supabase.from('order_profit').insert(rows).select('order_number, actual_income, created_at');
  if (error) {
    console.error('INSERT ERROR', error);
    return;
  }
  console.log('inserted', data.length, 'rows:');
  data
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .forEach((r) => console.log(' ', r.created_at, r.order_number, r.actual_income));
})();
