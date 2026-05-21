-- ============================================================
-- 修复 orders 表 RLS 导致 DELETE/UPDATE 静默失败的问题
-- 在 Supabase Dashboard → SQL Editor 中运行
-- https://supabase.com/dashboard/project/jpcvuonddoeldgzhswqb
-- ============================================================

-- 第一步：检查 orders 表当前 RLS 状态
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'orders';

-- 第二步：检查现有策略
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders';

-- ============================================================
-- 修复方案（二选一，推荐方案 A）
-- ============================================================

-- 方案 A：直接关闭 orders 表的 RLS（当前阶段最简单）
-- 适合：开发阶段，所有登录用户均可操作
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 方案 B：保留 RLS，添加全量策略（更规范，生产推荐）
-- 如果选方案 B，请注释掉方案 A，取消注释以下内容：
-- ============================================================
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
--
-- -- 删除旧策略（如有）
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON orders;
--
-- -- 允许已认证用户做所有操作
-- CREATE POLICY "Allow all for authenticated users" ON orders
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- ============================================================
-- 验证：执行后用此查询确认 RLS 已关闭
-- ============================================================
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'orders';
