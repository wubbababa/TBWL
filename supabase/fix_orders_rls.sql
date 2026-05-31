-- ============================================================
-- 修复 orders 表 RLS 导致 DELETE/UPDATE 静默失败的问题
-- 在 Supabase Dashboard → SQL Editor 中运行
-- https://supabase.com/dashboard/project/jpcvuonddoeldgzhswqb
-- ============================================================
--
-- ⚠ 安全说明（务必阅读）
-- 前端通过浏览器端 anon key 直连 Supabase（src/lib/supabase.ts），
-- 而 anon key 是公开打包进客户端 bundle 的。
-- 如果直接 `DISABLE ROW LEVEL SECURITY`，任何人拿到 anon key 即可
-- 调用 Supabase REST API 读写/删除全部订单，完全绕过 proxy.ts 登录守卫
-- （守卫只能拦 Next.js 页面路由，拦不住 Supabase API 端点）。
--
-- 因此这里采用「保留 RLS + 仅 authenticated 全量策略」：
--   - 未登录的 anon 请求 → 数据库层直接拒绝
--   - 已登录的 authenticated 用户 → 可正常增删改查
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
-- 修复方案：保留 RLS，添加 authenticated 全量策略
-- ============================================================

-- 1) 确保 RLS 处于启用状态（关键：不要 DISABLE）
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2) 删除所有残留的旧策略（幂等，重复执行安全）
--
-- ⚠ 重点：删除两条对 public 角色开放的 SELECT 策略！
-- Postgres 的多条 permissive 策略是「OR」关系——只要任意一条放行就放行。
-- public 角色包含 anon（未登录），所以只要这两条还在，
-- 任何人拿 anon key 仍能读取全部订单，下面的 authenticated 策略形同虚设。
DROP POLICY IF EXISTS "allow_all_read" ON orders;
DROP POLICY IF EXISTS "anyone_can_select_orders" ON orders;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON orders;

-- 3) 允许「已认证用户」执行全部操作（SELECT/INSERT/UPDATE/DELETE）
--    TO authenticated 限定角色 —— anon（未登录）不在此列，会被拒绝
CREATE POLICY "Allow all for authenticated users" ON orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 验证一：确认 RLS 已启用（rls_enabled 应为 true）
-- ============================================================
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'orders';

-- ============================================================
-- 验证二：确认策略清单。
-- 期望结果：只剩一条 "Allow all for authenticated users"，
--           roles = {authenticated}，cmd = ALL。
-- 如果还看到任何 roles 含 public/anon 的行 —— 说明仍有裸奔策略，需继续删除。
-- ============================================================
SELECT
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'orders';
