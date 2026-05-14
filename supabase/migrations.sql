-- TBWL 数据库架构扩展
-- 用于支持未实现的模块

-- 1. 库存商品表
CREATE TABLE IF NOT EXISTS inventory_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL,              -- 仓点
  sku TEXT UNIQUE NOT NULL,             -- 商品编号/货号/SKU
  name TEXT NOT NULL,                   -- 商品名
  thumbnail TEXT,                       -- 缩略图 URL
  price DECIMAL(10, 2) DEFAULT 0.00,    -- 价格
  total_count INTEGER DEFAULT 0,         -- 总数
  remaining_count INTEGER DEFAULT 0,     -- 剩余数量
  idle_days INTEGER DEFAULT 0,          -- 包裹闲置时长
  status TEXT DEFAULT '在库',           -- 状态 (在库, 出库, 损毁)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 未关联包裹表
CREATE TABLE IF NOT EXISTS unassociated_parcels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,  -- 物流单号
  weight DECIMAL(10, 2),                -- 重量 (kg)
  volume DECIMAL(10, 4),                -- 体积 (m³)
  status TEXT DEFAULT '待关联',         -- 状态 (待关联, 核对中, 已关联)
  inbound_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 入库时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 充值记录表
CREATE TABLE IF NOT EXISTS recharge_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT NOT NULL,                 -- 支付方式 (alipay, wechat)
  status TEXT DEFAULT '成功',           -- 状态 (成功, 待支付, 失败)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 异常件/索赔表
CREATE TABLE IF NOT EXISTS claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  tracking_number TEXT,
  reason TEXT NOT NULL,                 -- 异常原因
  claim_amount DECIMAL(10, 2),          -- 索赔金额
  status TEXT DEFAULT '待处理',         -- 状态 (待处理, 处理中, 已结案, 已拒绝)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 开启 RLS 权限 (示例)
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON inventory_products FOR SELECT USING (true);

ALTER TABLE unassociated_parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON unassociated_parcels FOR SELECT USING (true);
