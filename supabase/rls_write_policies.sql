-- ============================================================
-- TBWL — RLS 写入策略
-- 在 Supabase Dashboard → SQL Editor 中运行：
-- https://supabase.com/dashboard/project/jpcvuonddoeldgzhswqb/sql
--
-- 说明：当前所有表只有 SELECT 策略，INSERT/UPDATE/DELETE 被 RLS 拦截（403）。
-- 本文件为三个创建表单涉及的表添加写入策略。
-- 策略：允许所有已认证用户（auth.role() = 'authenticated'）写入。
-- ============================================================

-- ============================================================
-- 1. inventory_products — 库存商品
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inventory_products' AND policyname = 'authenticated_insert_inventory_products'
  ) THEN
    CREATE POLICY authenticated_insert_inventory_products
      ON inventory_products FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inventory_products' AND policyname = 'authenticated_update_inventory_products'
  ) THEN
    CREATE POLICY authenticated_update_inventory_products
      ON inventory_products FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inventory_products' AND policyname = 'authenticated_delete_inventory_products'
  ) THEN
    CREATE POLICY authenticated_delete_inventory_products
      ON inventory_products FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ============================================================
-- 2. inventory_apply — 入库申请
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inventory_apply' AND policyname = 'authenticated_insert_inventory_apply'
  ) THEN
    CREATE POLICY authenticated_insert_inventory_apply
      ON inventory_apply FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inventory_apply' AND policyname = 'authenticated_update_inventory_apply'
  ) THEN
    CREATE POLICY authenticated_update_inventory_apply
      ON inventory_apply FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inventory_apply' AND policyname = 'authenticated_delete_inventory_apply'
  ) THEN
    CREATE POLICY authenticated_delete_inventory_apply
      ON inventory_apply FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ============================================================
-- 3. taiwan_apply — 台湾发货申请
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'taiwan_apply' AND policyname = 'authenticated_insert_taiwan_apply'
  ) THEN
    CREATE POLICY authenticated_insert_taiwan_apply
      ON taiwan_apply FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'taiwan_apply' AND policyname = 'authenticated_update_taiwan_apply'
  ) THEN
    CREATE POLICY authenticated_update_taiwan_apply
      ON taiwan_apply FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'taiwan_apply' AND policyname = 'authenticated_delete_taiwan_apply'
  ) THEN
    CREATE POLICY authenticated_delete_taiwan_apply
      ON taiwan_apply FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ============================================================
-- 4. inventory_records — 库存扣减记录
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inventory_records' AND policyname = 'authenticated_insert_inventory_records'
  ) THEN
    CREATE POLICY authenticated_insert_inventory_records
      ON inventory_records FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- 验证：查看三张表的所有策略
-- ============================================================
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('inventory_products', 'inventory_apply', 'taiwan_apply', 'inventory_records')
ORDER BY tablename, cmd;
