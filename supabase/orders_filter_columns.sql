-- ============================================================
-- TBWL — orders 表筛选维度字段补全
-- 在 Supabase Dashboard → SQL Editor 中运行：
-- https://supabase.com/dashboard/project/jpcvuonddoeldgzhswqb/sql
--
-- 背景：
--   FilterForm 定义了 12 个筛选字段，但 orders 表仅有
--   order_number / shipping_method / status / tracking_info / created_at 等，
--   导致 recipient（收件人）、orderer（下单人）、store_name（店铺）、
--   order_type（订单类型）以及 提交/转运/入店 时间无列可查。
--
--   本脚本为 orders 表补齐这些列，使 FilterForm 全部字段可真正接入查询。
--   幂等：可重复执行（ADD COLUMN IF NOT EXISTS）。
-- ============================================================

-- -----------------------------------------------------------
-- 1. 业务维度字段
-- -----------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient   TEXT;  -- 收件人姓名/电话
ALTER TABLE orders ADD COLUMN IF NOT EXISTS orderer     TEXT;  -- 下单人
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_name  TEXT;  -- 所属店铺
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type  TEXT;  -- 订单类型

-- -----------------------------------------------------------
-- 2. 状态流转时间字段（获取时间沿用 created_at，无需新增）
-- -----------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS submitted_at    TIMESTAMPTZ; -- 提交时间
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transferred_at  TIMESTAMPTZ; -- 转运时间
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_entry_at  TIMESTAMPTZ; -- 入店时间

-- -----------------------------------------------------------
-- 3. 索引（提升筛选 + 分页排序性能）
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_shipping       ON orders (shipping_method);
CREATE INDEX IF NOT EXISTS idx_orders_store_name     ON orders (store_name);
CREATE INDEX IF NOT EXISTS idx_orders_order_type     ON orders (order_type);
CREATE INDEX IF NOT EXISTS idx_orders_submitted_at   ON orders (submitted_at);
CREATE INDEX IF NOT EXISTS idx_orders_transferred_at ON orders (transferred_at);
CREATE INDEX IF NOT EXISTS idx_orders_store_entry_at ON orders (store_entry_at);

-- -----------------------------------------------------------
-- 验证
-- -----------------------------------------------------------
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
