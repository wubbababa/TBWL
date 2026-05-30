-- ============================================================
-- TBWL — 订单面单（Waybill）上传/下载支持
-- 在 Supabase Dashboard → SQL Editor 中运行：
-- https://supabase.com/dashboard/project/jpcvuonddoeldgzhswqb/sql
--
-- 本脚本：
--   1. 为 orders 表添加面单相关字段
--   2. 创建私有 Storage Bucket: waybills
--   3. 为该 Bucket 添加已认证用户的读/写/删策略
-- 幂等：可重复执行。
-- ============================================================

-- -----------------------------------------------------------
-- 1. orders 表新增面单字段
-- -----------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waybill_path        TEXT;        -- Storage 内对象路径
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waybill_filename    TEXT;        -- 原始文件名（用于下载）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waybill_uploaded_at TIMESTAMPTZ; -- 面单上传时间

-- -----------------------------------------------------------
-- 2. 创建私有 Storage Bucket（不公开，统一通过签名 URL 访问）
-- -----------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('waybills', 'waybills', false)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------
-- 3. Storage 访问策略（已认证用户可读/写/删 waybills 桶内对象）
-- -----------------------------------------------------------
DROP POLICY IF EXISTS "waybills_authenticated_select" ON storage.objects;
CREATE POLICY "waybills_authenticated_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'waybills');

DROP POLICY IF EXISTS "waybills_authenticated_insert" ON storage.objects;
CREATE POLICY "waybills_authenticated_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'waybills');

DROP POLICY IF EXISTS "waybills_authenticated_update" ON storage.objects;
CREATE POLICY "waybills_authenticated_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'waybills')
  WITH CHECK (bucket_id = 'waybills');

DROP POLICY IF EXISTS "waybills_authenticated_delete" ON storage.objects;
CREATE POLICY "waybills_authenticated_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'waybills');

-- -----------------------------------------------------------
-- 验证
-- -----------------------------------------------------------
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name LIKE 'waybill%'
ORDER BY column_name;

SELECT id, name, public FROM storage.buckets WHERE id = 'waybills';
