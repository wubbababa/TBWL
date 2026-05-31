/**
 * 为 orders 表的筛选维度列回填模拟数据：
 *   recipient（收件人）、orderer（下单人）、store_name（店铺）、
 *   order_type（订单类型）、submitted_at（提交时间）、
 *   transferred_at（转运时间）、store_entry_at（入店时间）
 *
 * 特性：
 *   - 需要 SUPABASE_SERVICE_ROLE_KEY（绕过 RLS 写入），从 .env.local 读取。
 *   - 依据每条订单已有的 status / created_at 生成符合业务流转的时间。
 *   - 确定性随机（基于 order_number 哈希）：重复运行结果一致、幂等。
 *
 * 运行：node scripts/seed-order-filters.js
 *       node scripts/seed-order-filters.js --force   # 覆盖已有非空值
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim();

const url = get('NEXT_PUBLIC_SUPABASE_URL');
const serviceKey = get('SUPABASE_SERVICE_ROLE_KEY');

if (!url || !serviceKey) {
  console.error('[错误] 缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY（请检查 .env.local）。');
  process.exit(1);
}

const FORCE = process.argv.includes('--force');
const supabase = createClient(url, serviceKey);

/* ----------------------- 确定性随机工具 ----------------------- */
function strHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];

/* ----------------------- 数据池 ----------------------- */
const SURNAMES = '王李张刘陈杨黄赵周吴徐孙朱马胡郭林何高梁郑罗宋谢唐韩曹许邓萧冯曾程蔡彭潘袁'.split('');
const GIVEN = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '霞', '平', '刚', '桂英', '志强', '建华', '海燕'];
const STORES = ['深圳仓', '台北仓', '台中仓', '高雄仓'];
const ORDER_TYPES = ['普通订单', '预售订单', '补发订单', '退货订单'];

/* ----------------------- 状态 → 时间流转规则 ----------------------- */
// 哪些状态意味着订单已"提交 / 转运 / 入店"。
const AFTER_SUBMIT = new Set([
  '已提交/待打包', '转运中', '预刷件', '取消中', '异常件',
  '待确认入店', '已送店', '退件重发', '已关闭',
]);
const AFTER_TRANSFER = new Set([
  '转运中', '预刷件', '异常件', '待确认入店', '已送店', '退件重发', '已关闭',
]);
const AFTER_STORE_ENTRY = new Set([
  '待确认入店', '已送店', '退件重发', '已关闭',
]);

function addHours(date, h) { return new Date(date.getTime() + h * 3600 * 1000); }
function addDays(date, d) { return new Date(date.getTime() + d * 24 * 3600 * 1000); }

function buildPatch(order) {
  const rand = mulberry32(strHash(order.order_number || String(order.id)));

  const recipientName = pick(rand, SURNAMES) + pick(rand, GIVEN);
  const phone = '1' + pick(rand, ['3', '5', '7', '8', '9']) + Math.floor(rand() * 9) +
    '****' + String(1000 + Math.floor(rand() * 9000));
  const ordererName = pick(rand, SURNAMES) + pick(rand, GIVEN);

  const patch = {
    recipient: `${recipientName} ${phone}`,
    orderer: ordererName,
    store_name: pick(rand, STORES),
    order_type: pick(rand, ORDER_TYPES),
    submitted_at: null,
    transferred_at: null,
    store_entry_at: null,
  };

  const created = new Date(order.created_at || Date.now());
  const status = order.status || '';

  if (AFTER_SUBMIT.has(status)) {
    const submitted = addHours(created, 6 + Math.floor(rand() * 24)); // +6~30h
    patch.submitted_at = submitted.toISOString();

    if (AFTER_TRANSFER.has(status)) {
      const transferred = addDays(submitted, 1 + Math.floor(rand() * 4)); // +1~4d
      patch.transferred_at = transferred.toISOString();

      if (AFTER_STORE_ENTRY.has(status)) {
        const entry = addDays(transferred, 2 + Math.floor(rand() * 5)); // +2~6d
        patch.store_entry_at = entry.toISOString();
      }
    }
  }

  return patch;
}

/* ----------------------- 主流程 ----------------------- */
(async () => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, status, created_at, recipient');

  if (error) { console.error('读取订单失败:', error.message); process.exit(1); }
  if (!orders || orders.length === 0) { console.log('orders 表为空，无需回填。'); return; }

  // 默认只回填 recipient 为空的行；--force 时全部覆盖。
  const targets = FORCE ? orders : orders.filter((o) => !o.recipient);
  console.log(`共 ${orders.length} 条订单，待回填 ${targets.length} 条${FORCE ? '（--force 覆盖全部）' : '（仅空记录）'}。`);

  if (targets.length === 0) { console.log('没有需要回填的记录。可加 --force 覆盖。'); return; }

  let ok = 0;
  let fail = 0;
  for (const order of targets) {
    const patch = buildPatch(order);
    const { data: updated, error: updErr } = await supabase
      .from('orders')
      .update(patch)
      .eq('id', order.id)
      .select('id');

    if (updErr) {
      fail++;
      console.error(`  ✗ ${order.order_number}: ${updErr.message}`);
    } else if (!updated || updated.length === 0) {
      fail++;
      console.error(`  ✗ ${order.order_number}: 更新 0 行（疑似 RLS 拦截，请确认使用 service_role key）`);
    } else {
      ok++;
    }
  }

  console.log(`\n完成：成功 ${ok} 条，失败 ${fail} 条。`);

  // 抽样展示前 5 条结果
  const { data: sample } = await supabase
    .from('orders')
    .select('order_number, status, recipient, orderer, store_name, order_type, submitted_at, transferred_at, store_entry_at')
    .order('created_at', { ascending: false })
    .limit(5);
  if (sample) {
    console.log('\n抽样（最新 5 条）：');
    for (const s of sample) {
      console.log(` ${s.order_number} [${s.status}] 收件:${s.recipient} 下单:${s.orderer} 店铺:${s.store_name} 类型:${s.order_type}`);
      console.log(`   提交:${s.submitted_at || '-'} 转运:${s.transferred_at || '-'} 入店:${s.store_entry_at || '-'}`);
    }
  }
})();
