-- ============================================================
-- 修复多表 RLS 写操作被静默拦截的问题
-- 在 Supabase Dashboard → SQL Editor 中运行
-- https://supabase.com/dashboard/project/jpcvuonddoeldgzhswqb
-- ============================================================
--
-- 问题: 所有非 orders 表只有 public SELECT 策略，
--       authenticated 用户的 INSERT/UPDATE/DELETE 被 RLS 静默拒绝。
--
-- 方案: 删除旧 public SELECT 策略，改用 authenticated FOR ALL 策略
--       （与 fix_orders_rls.sql 同一模式）
-- ============================================================

-- ─────────────────────────────────────────
-- 1. abnormal_parcels（异常包裹）
--    写操作: page.tsx → .update({ process_action, processed_at })
-- ─────────────────────────────────────────
ALTER TABLE abnormal_parcels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_abnormal_parcels" ON abnormal_parcels;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON abnormal_parcels;

CREATE POLICY "Allow all for authenticated users" ON abnormal_parcels
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────
-- 2. inventory_products（库存商品）
--    写操作: CreateInventoryProductModal → .insert()
-- ─────────────────────────────────────────
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_inventory_products" ON inventory_products;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON inventory_products;

CREATE POLICY "Allow all for authenticated users" ON inventory_products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────
-- 3. inventory_apply（入库申请）
--    写操作: CreateInventoryApplyModal → .insert()
-- ─────────────────────────────────────────
ALTER TABLE inventory_apply ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_inventory_apply" ON inventory_apply;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON inventory_apply;

CREATE POLICY "Allow all for authenticated users" ON inventory_apply
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────
-- 4. taiwan_apply（台湾发货申请）
--    写操作: CreateTaiwanApplyModal → .insert()
-- ─────────────────────────────────────────
ALTER TABLE taiwan_apply ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_taiwan_apply" ON taiwan_apply;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON taiwan_apply;

CREATE POLICY "Allow all for authenticated users" ON taiwan_apply
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 验证：确认策略清单
-- 期望结果：以上 4 表各有一条 authenticated FOR ALL 策略
-- ============================================================
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('abnormal_parcels', 'inventory_products', 'inventory_apply', 'taiwan_apply')
ORDER BY tablename;
