-- ============================================================
-- TBWL 全模块测试数据
-- 在 Supabase Dashboard → SQL Editor 中运行
-- https://supabase.com/dashboard/project/jpcvuonddoeldgzhswqb
-- ============================================================

-- ============================================================
-- 0. 建表（包含 migrations.sql 全部内容 + 新增表）
-- ============================================================

-- 库存商品表（来自 migrations.sql）
CREATE TABLE IF NOT EXISTS inventory_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  thumbnail TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  total_count INTEGER DEFAULT 0,
  remaining_count INTEGER DEFAULT 0,
  idle_days INTEGER DEFAULT 0,
  status TEXT DEFAULT '在库',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 未关联包裹表（来自 migrations.sql）
CREATE TABLE IF NOT EXISTS unassociated_parcels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,
  weight DECIMAL(10, 2),
  volume DECIMAL(10, 4),
  status TEXT DEFAULT '待关联',
  inbound_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 充值记录表（来自 migrations.sql）
CREATE TABLE IF NOT EXISTS recharge_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT NOT NULL,
  status TEXT DEFAULT '成功',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索赔表（来自 migrations.sql）
CREATE TABLE IF NOT EXISTS claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  tracking_number TEXT,
  reason TEXT NOT NULL,
  claim_amount DECIMAL(10, 2),
  status TEXT DEFAULT '待处理',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 入库存申请表
CREATE TABLE IF NOT EXISTS inventory_apply (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode TEXT UNIQUE NOT NULL,           -- 仓单条码
  warehouse TEXT NOT NULL,               -- 仓库
  tracking_number TEXT,                  -- 快递单号
  sku TEXT,                              -- SKU/商品名
  location TEXT,                         -- 库位号
  quantity INTEGER DEFAULT 1,            -- 数量
  next_charge_at TIMESTAMP WITH TIME ZONE, -- 下次扣费时间
  remarks TEXT,                          -- 备注
  status TEXT DEFAULT '待入库',          -- 状态
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 库存调用记录表
CREATE TABLE IF NOT EXISTS inventory_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID,                       -- 商品ID（关联 inventory_products）
  order_number TEXT,                     -- 订单编号
  sku TEXT,                              -- SKU/商品名
  quantity INTEGER DEFAULT 1,            -- 调用数量
  description TEXT,                      -- 描述
  status TEXT DEFAULT '已完成',          -- 状态
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 退件包裹表
CREATE TABLE IF NOT EXISTS returns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,  -- 物流单号
  original_order TEXT,                   -- 原订单号
  reason TEXT,                           -- 退件原因
  status TEXT DEFAULT '待处理',          -- 状态
  returned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 消费记录表
CREATE TABLE IF NOT EXISTS expense_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT UNIQUE NOT NULL,    -- 流水号
  expense_type TEXT NOT NULL,            -- 消费类型
  reference TEXT,                        -- 订单编号/快递单号/店铺名
  description TEXT,                      -- 描述
  points DECIMAL(10, 2) DEFAULT 0,       -- 积分
  status TEXT DEFAULT '成功',            -- 状态
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 运输费记录表
CREATE TABLE IF NOT EXISTS shipping_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT UNIQUE NOT NULL,    -- 流水号
  reference TEXT,                        -- 订单号/快递包裹
  shipping_method TEXT,                  -- 运输方式
  weight DECIMAL(10, 3),                 -- 重量(KG)
  description TEXT,                      -- 描述
  points DECIMAL(10, 2) DEFAULT 0,       -- 积分
  status TEXT DEFAULT '成功',            -- 状态
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 扫码转账登记表
CREATE TABLE IF NOT EXISTS scan_register (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT UNIQUE NOT NULL,    -- 流水号
  payment_method TEXT NOT NULL,          -- 支付方式
  amount DECIMAL(10, 2) NOT NULL,        -- 转账金额
  remarks TEXT,                          -- 备注
  status TEXT DEFAULT '成功',            -- 状态
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单利润表
CREATE TABLE IF NOT EXISTS order_profit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,     -- 订单编号
  sales_amount DECIMAL(10, 2) DEFAULT 0, -- 销售金额(TWD)
  paid_amount DECIMAL(10, 2) DEFAULT 0,  -- 实付金额(TWD)
  other_fees DECIMAL(10, 2) DEFAULT 0,   -- 其它费用(TWD)
  logistics_cost DECIMAL(10, 2) DEFAULT 0, -- 物流成本(TWD)
  order_income DECIMAL(10, 2) DEFAULT 0, -- 订单收入(CNY)
  purchase_cost DECIMAL(10, 2) DEFAULT 0, -- 采购成本(CNY)
  inventory_cost DECIMAL(10, 2) DEFAULT 0, -- 库存成本(CNY)
  freight_cost DECIMAL(10, 2) DEFAULT 0, -- 货代成本(CNY)
  actual_income DECIMAL(10, 2) DEFAULT 0, -- 实际收入(CNY)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 台湾仓发货申请表
CREATE TABLE IF NOT EXISTS taiwan_apply (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_code TEXT NOT NULL,             -- 会员/代理/货件编号
  product_count INTEGER DEFAULT 1,       -- 商品数
  manifest_type TEXT DEFAULT '普通',     -- 舱单类型
  status TEXT DEFAULT '待处理',          -- 货件状态
  remarks TEXT,                          -- 备注
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 异常包裹表
CREATE TABLE IF NOT EXISTS abnormal_parcels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT,                  -- 快递单号
  order_number TEXT,                     -- 订单编号
  abnormal_type TEXT NOT NULL,           -- 异常类型
  process_action TEXT,                   -- 处理方式
  idle_days INTEGER DEFAULT 0,           -- 包裹闲置时长(天)
  processed_at TIMESTAMP WITH TIME ZONE, -- 处理时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 开启 RLS（全部用 DO 块做幂等处理）
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='inventory_products' AND policyname='public_read_inventory_products') THEN
    CREATE POLICY public_read_inventory_products ON inventory_products FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE unassociated_parcels ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='unassociated_parcels' AND policyname='public_read_unassociated_parcels') THEN
    CREATE POLICY public_read_unassociated_parcels ON unassociated_parcels FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE recharge_records ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recharge_records' AND policyname='public_read_recharge_records') THEN
    CREATE POLICY public_read_recharge_records ON recharge_records FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='claims' AND policyname='public_read_claims') THEN
    CREATE POLICY public_read_claims ON claims FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE inventory_apply ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='inventory_apply' AND policyname='public_read_inventory_apply') THEN
    CREATE POLICY public_read_inventory_apply ON inventory_apply FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE inventory_records ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='inventory_records' AND policyname='public_read_inventory_records') THEN
    CREATE POLICY public_read_inventory_records ON inventory_records FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='returns' AND policyname='public_read_returns') THEN
    CREATE POLICY public_read_returns ON returns FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='expense_records' AND policyname='public_read_expense_records') THEN
    CREATE POLICY public_read_expense_records ON expense_records FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE shipping_records ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='shipping_records' AND policyname='public_read_shipping_records') THEN
    CREATE POLICY public_read_shipping_records ON shipping_records FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE scan_register ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scan_register' AND policyname='public_read_scan_register') THEN
    CREATE POLICY public_read_scan_register ON scan_register FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE order_profit ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_profit' AND policyname='public_read_order_profit') THEN
    CREATE POLICY public_read_order_profit ON order_profit FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE taiwan_apply ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='taiwan_apply' AND policyname='public_read_taiwan_apply') THEN
    CREATE POLICY public_read_taiwan_apply ON taiwan_apply FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE abnormal_parcels ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='abnormal_parcels' AND policyname='public_read_abnormal_parcels') THEN
    CREATE POLICY public_read_abnormal_parcels ON abnormal_parcels FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================================
-- 1. inventory_products — 库存商品（深圳仓 + 台湾仓）
-- ============================================================
INSERT INTO inventory_products (store_name, sku, name, price, total_count, remaining_count, idle_days, status, created_at) VALUES
-- 深圳仓
('深圳仓', 'SZ-SKU-001', '苹果手机壳 iPhone15 透明款', 12.50, 200, 185, 3, '在库', '2026-04-10 09:00:00+08'),
('深圳仓', 'SZ-SKU-002', '钢化玻璃膜 通用9H', 5.80, 500, 432, 5, '在库', '2026-04-12 10:30:00+08'),
('深圳仓', 'SZ-SKU-003', '蓝牙耳机 TWS无线入耳式', 68.00, 80, 62, 8, '在库', '2026-04-15 14:00:00+08'),
('深圳仓', 'SZ-SKU-004', '充电宝 20000mAh 快充版', 89.00, 50, 38, 12, '在库', '2026-04-18 11:00:00+08'),
('深圳仓', 'SZ-SKU-005', '数据线 Type-C 1米编织', 9.90, 300, 271, 2, '在库', '2026-04-20 08:30:00+08'),
('深圳仓', 'SZ-SKU-006', '无线鼠标 2.4G 静音款', 35.00, 60, 45, 15, '在库', '2026-04-22 13:00:00+08'),
('深圳仓', 'SZ-SKU-007', '机械键盘 87键 青轴', 159.00, 30, 22, 20, '在库', '2026-04-25 09:00:00+08'),
('深圳仓', 'SZ-SKU-008', '收纳盒 桌面整理 大号', 28.00, 100, 88, 6, '在库', '2026-04-28 10:00:00+08'),
('深圳仓', 'SZ-SKU-009', '护肤品套装 补水保湿5件套', 128.00, 40, 28, 18, '在库', '2026-05-01 09:00:00+08'),
('深圳仓', 'SZ-SKU-010', '运动水壶 500ml 不锈钢', 45.00, 120, 105, 4, '在库', '2026-05-03 11:00:00+08'),
('深圳仓', 'SZ-SKU-011', '笔记本支架 铝合金折叠', 79.00, 45, 30, 22, '在库', '2026-04-08 08:00:00+08'),
('深圳仓', 'SZ-SKU-012', '手机支架 车载磁吸款', 25.00, 150, 0, 35, '出库', '2026-03-20 09:00:00+08'),
-- 台北仓
('台北仓', 'TW-SKU-001', '珍珠奶茶杯套 隔热款', 18.00, 200, 176, 5, '在库', '2026-04-15 10:00:00+08'),
('台北仓', 'TW-SKU-002', '台湾凤梨酥礼盒 12入', 320.00, 60, 48, 7, '在库', '2026-04-18 09:00:00+08'),
('台北仓', 'TW-SKU-003', '环保购物袋 折叠便携', 55.00, 100, 82, 10, '在库', '2026-04-20 14:00:00+08'),
('台北仓', 'TW-SKU-004', '手工皂 薰衣草香 100g', 85.00, 80, 65, 3, '在库', '2026-04-25 11:00:00+08'),
('台北仓', 'TW-SKU-005', '竹制餐具套装 环保款', 120.00, 50, 38, 14, '在库', '2026-04-28 10:00:00+08'),
-- 台中仓
('台中仓', 'TC-SKU-001', '自行车头盔 成人款 M号', 450.00, 30, 24, 8, '在库', '2026-04-22 09:00:00+08'),
('台中仓', 'TC-SKU-002', '瑜伽垫 TPE材质 6mm', 280.00, 40, 33, 11, '在库', '2026-04-26 10:00:00+08'),
-- 高雄仓
('高雄仓', 'KH-SKU-001', '海鲜礼盒 冷冻装 1kg', 580.00, 20, 15, 2, '在库', '2026-05-01 08:00:00+08'),
('高雄仓', 'KH-SKU-002', '芒果干 原味 200g', 95.00, 100, 87, 6, '在库', '2026-05-03 09:00:00+08')
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- 2. unassociated_parcels — 未关联包裹
-- ============================================================
INSERT INTO unassociated_parcels (tracking_number, weight, volume, status, inbound_at) VALUES
('JT547175123456', 0.85, 0.0012, '待关联', '2026-05-01 10:30:00+08'),
('SF1234567890AB', 1.20, 0.0018, '待关联', '2026-05-02 09:15:00+08'),
('YT9876543210CD', 2.50, 0.0035, '核对中', '2026-05-02 14:00:00+08'),
('ZT0011223344EF', 0.45, 0.0008, '待关联', '2026-05-03 08:30:00+08'),
('JD5566778899GH', 3.10, 0.0042, '待关联', '2026-05-03 11:00:00+08'),
('SF2233445566IJ', 0.60, 0.0010, '核对中', '2026-05-04 09:00:00+08'),
('YT1122334455KL', 1.80, 0.0025, '待关联', '2026-05-04 13:30:00+08'),
('EMS9988776655MN', 0.30, 0.0005, '待关联', '2026-05-05 08:00:00+08'),
('SF3344556677OP', 4.20, 0.0058, '待关联', '2026-05-05 10:00:00+08'),
('ZT7788990011QR', 1.05, 0.0015, '核对中', '2026-05-06 09:30:00+08')
ON CONFLICT (tracking_number) DO NOTHING;

-- ============================================================
-- 3. recharge_records — 充值记录
-- ============================================================
INSERT INTO recharge_records (amount, method, status, created_at) VALUES
(1000.00, 'alipay', '成功', '2026-05-12 14:20:00+08'),
(500.00,  'wechat', '成功', '2026-05-01 09:15:00+08'),
(2000.00, 'alipay', '成功', '2026-04-20 16:30:00+08'),
(300.00,  'wechat', '成功', '2026-04-15 11:00:00+08'),
(5000.00, 'alipay', '成功', '2026-04-10 10:00:00+08'),
(200.00,  'wechat', '待支付', '2026-05-14 08:30:00+08'),
(1500.00, 'alipay', '成功', '2026-03-28 14:00:00+08'),
(800.00,  'wechat', '成功', '2026-03-15 09:30:00+08'),
(100.00,  'alipay', '失败', '2026-05-10 17:00:00+08'),
(3000.00, 'alipay', '成功', '2026-03-05 10:00:00+08');

-- ============================================================
-- 4. claims — 索赔记录
-- ============================================================
INSERT INTO claims (order_number, tracking_number, reason, claim_amount, status, created_at) VALUES
('ORD-TBWL-20260410-0501', 'SF3000000001', '运输中破损，精密仪器受损', 850.00, '处理中', '2026-04-18 10:00:00+08'),
('ORD-TBWL-20260412-0502', 'SF3000000002', '液体产品漏液，货物污染', 320.00, '待处理', '2026-04-20 09:00:00+08'),
('ORD-TBWL-20260414-0503', 'YT3000000003', '海关查验导致延误，客户索赔', 1200.00, '处理中', '2026-04-22 14:00:00+08'),
('ORD-TBWL-20260416-0504', '',             '食品保质期临近，客户拒收', 450.00, '已结案', '2026-04-25 11:00:00+08'),
('ORD-TBWL-20260418-0505', '',             '地址不详导致无法投递，退件损失', 180.00, '已拒绝', '2026-04-28 10:00:00+08'),
('ORD-TBWL-20260420-1006', '',             '音箱外壳破裂，无法正常使用', 560.00, '待处理', '2026-04-28 15:00:00+08'),
('ORD-TBWL-20260401-0801', 'SF6000000001', '原单退回时包装破损', 95.00,  '已结案', '2026-04-22 09:00:00+08'),
('ORD-TBWL-20260405-0802', 'SF6000000002', '充电宝运输中损坏，无法充电', 230.00, '处理中', '2026-04-25 10:00:00+08')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. inventory_apply — 入库存申请
-- ============================================================
INSERT INTO inventory_apply (barcode, warehouse, tracking_number, sku, location, quantity, next_charge_at, remarks, status, created_at) VALUES
('WH-BAR-20260501-001', '深圳仓', 'SF1234567890', 'SZ-SKU-001 / 苹果手机壳', 'A-01-03', 50, '2026-06-01 00:00:00+08', '', '已入库', '2026-05-01 09:00:00+08'),
('WH-BAR-20260501-002', '深圳仓', 'SF1234567891', 'SZ-SKU-003 / 蓝牙耳机', 'B-02-05', 20, '2026-06-01 00:00:00+08', '需检测功能', '已入库', '2026-05-01 10:30:00+08'),
('WH-BAR-20260502-003', '深圳仓', 'YT9876543210', 'SZ-SKU-007 / 机械键盘', 'C-03-02', 10, '2026-06-02 00:00:00+08', '', '待入库', '2026-05-02 09:00:00+08'),
('WH-BAR-20260502-004', '台北仓', 'SF2000000001', 'TW-SKU-001 / 珍珠奶茶杯套', 'TW-A-01', 100, '2026-06-02 00:00:00+08', '', '已入库', '2026-05-02 11:00:00+08'),
('WH-BAR-20260503-005', '深圳仓', 'SF2000000002', 'SZ-SKU-009 / 护肤品套装', 'A-04-01', 15, '2026-06-03 00:00:00+08', '易碎品', '审核中', '2026-05-03 08:30:00+08'),
('WH-BAR-20260503-006', '台中仓', 'YT1230987654', 'TC-SKU-001 / 自行车头盔', 'TC-B-02', 8, '2026-06-03 00:00:00+08', '', '待入库', '2026-05-03 10:00:00+08'),
('WH-BAR-20260504-007', '深圳仓', 'SF3000000001', 'SZ-SKU-005 / 数据线', 'A-01-08', 200, '2026-06-04 00:00:00+08', '', '已入库', '2026-05-04 09:00:00+08'),
('WH-BAR-20260504-008', '高雄仓', 'SF4000000001', 'KH-SKU-001 / 海鲜礼盒', 'KH-C-01', 5, '2026-06-04 00:00:00+08', '冷链运输', '审核中', '2026-05-04 14:00:00+08')
ON CONFLICT (barcode) DO NOTHING;

-- ============================================================
-- 6. inventory_records — 库存调用记录
-- ============================================================
INSERT INTO inventory_records (order_number, sku, quantity, description, status, created_at) VALUES
('ORD-TBWL-20260501-0001', 'SZ-SKU-001 / 苹果手机壳', 50, '订单出库，发往台湾', '已完成', '2026-05-02 10:00:00+08'),
('ORD-TBWL-20260501-0002', 'SZ-SKU-003 / 蓝牙耳机', 20, '订单出库，空运', '已完成', '2026-05-02 11:30:00+08'),
('ORD-TBWL-20260502-0004', 'SZ-SKU-006 / 无线鼠标', 15, '订单出库，发往台湾', '已完成', '2026-05-03 09:00:00+08'),
('ORD-TBWL-20260503-0007', 'SZ-SKU-008 / 收纳盒', 30, '海运出库', '处理中', '2026-05-04 08:30:00+08'),
('ORD-TBWL-20260420-0701', 'TW-SKU-001 / 珍珠奶茶杯套', 24, '台北仓出库，门店配送', '已完成', '2026-05-01 14:00:00+08'),
('ORD-TBWL-20260421-0702', 'TW-SKU-002 / 凤梨酥礼盒', 12, '台北仓出库', '已完成', '2026-05-02 10:00:00+08'),
('ORD-TBWL-20260422-0703', 'TC-SKU-002 / 瑜伽垫', 7, '台中仓出库', '处理中', '2026-05-03 11:00:00+08'),
('ORD-TBWL-20260423-0704', 'SZ-SKU-002 / 钢化膜', 68, '批量出库，发往台湾', '已完成', '2026-05-04 09:30:00+08');

-- ============================================================
-- 7. returns — 退件包裹
-- ============================================================
INSERT INTO returns (tracking_number, original_order, reason, status, returned_at) VALUES
('SF6000000001', 'ORD-TBWL-20260401-0801', '客户拒收', '已收到', '2026-04-18 14:00:00+08'),
('SF6000000002', 'ORD-TBWL-20260405-0802', '质量问题退货', '已重发', '2026-04-20 10:00:00+08'),
('SF6000000003', 'ORD-TBWL-20260408-0803', '尺码不符退回', '待处理', '2026-04-25 09:00:00+08'),
('YT8800001234', 'ORD-TBWL-20260415-0401', '地址错误无法投递', '已收到', '2026-04-22 11:00:00+08'),
('SF9900005678', 'ORD-TBWL-20260418-0402', '客户中途取消', '待处理', '2026-04-26 15:00:00+08'),
('JT1122334455', 'ORD-TBWL-20260420-0403', '重复订单退回', '已重发', '2026-04-28 10:00:00+08')
ON CONFLICT (tracking_number) DO NOTHING;

-- ============================================================
-- 8. expense_records — 消费记录
-- ============================================================
INSERT INTO expense_records (serial_number, expense_type, reference, description, points, status, occurred_at) VALUES
('EXP-20260501-0001', '运费', 'ORD-TBWL-20260501-0001', '空运费用 - 手机壳 x50', -45.60, '成功', '2026-05-01 10:00:00+08'),
('EXP-20260501-0002', '打包费', 'ORD-TBWL-20260501-0002', '打包贴单费 - 蓝牙耳机 x20', -12.00, '成功', '2026-05-01 11:00:00+08'),
('EXP-20260502-0003', '运费', 'ORD-TBWL-20260502-0004', '空运费用 - 智能手表 x10', -88.00, '成功', '2026-05-02 09:30:00+08'),
('EXP-20260502-0004', '仓储费', 'SZ-SKU-011', '笔记本支架仓储费 22天', -8.80, '成功', '2026-05-02 10:00:00+08'),
('EXP-20260503-0005', '运费', 'ORD-TBWL-20260503-0007', '海运费用 - 户外帐篷 x8', -156.00, '成功', '2026-05-03 08:00:00+08'),
('EXP-20260503-0006', '打包费', 'ORD-TBWL-20260503-0008', '打包贴单费 - 平板保护套 x40', -20.00, '成功', '2026-05-03 09:00:00+08'),
('EXP-20260504-0007', '运费', 'ORD-TBWL-20260504-0010', '陆运费用 - 宠物笼 x6', -72.00, '成功', '2026-05-04 08:30:00+08'),
('EXP-20260504-0008', '仓储费', 'SZ-SKU-009', '护肤品套装仓储费 18天', -14.40, '成功', '2026-05-04 10:00:00+08'),
('EXP-20260505-0009', '运费', 'ORD-TBWL-20260420-0701', '空运费用 - 服装 x50', -95.00, '成功', '2026-05-05 09:00:00+08'),
('EXP-20260505-0010', '理赔扣款', 'CLM-20260510-01', '索赔处理手续费', -25.00, '成功', '2026-05-05 14:00:00+08'),
('EXP-20260506-0011', '运费', 'ORD-TBWL-20260421-0702', '空运费用 - 书籍 x100', -68.00, '成功', '2026-05-06 08:00:00+08'),
('EXP-20260506-0012', '打包费', 'ORD-TBWL-20260422-0703', '打包贴单费 - 家居装饰品 x30', -15.00, '成功', '2026-05-06 10:00:00+08')
ON CONFLICT (serial_number) DO NOTHING;

-- ============================================================
-- 9. shipping_records — 运输费记录
-- ============================================================
INSERT INTO shipping_records (serial_number, reference, shipping_method, weight, description, points, status, occurred_at) VALUES
('SHP-20260501-0001', 'ORD-TBWL-20260501-0001 / SF1234567890', '空运', 2.500, '手机壳 x50 + 钢化膜 x30', -45.60, '成功', '2026-05-01 10:00:00+08'),
('SHP-20260501-0002', 'ORD-TBWL-20260501-0002 / SF1234567891', '空运', 1.800, '蓝牙耳机 x20 + 充电线 x40', -32.40, '成功', '2026-05-01 11:30:00+08'),
('SHP-20260502-0003', 'ORD-TBWL-20260502-0004 / SF1234567892', '空运', 0.850, '智能手表 x10 + 表带 x25', -15.30, '成功', '2026-05-02 09:00:00+08'),
('SHP-20260503-0004', 'ORD-TBWL-20260503-0007 / YT9876543210', '海运', 18.500, '户外帐篷 x8 + 睡袋 x12', -156.00, '成功', '2026-05-03 08:00:00+08'),
('SHP-20260503-0005', 'ORD-TBWL-20260503-0008 / SF2000000001', '空运', 3.200, '平板保护套 x40 + 键盘 x10', -57.60, '成功', '2026-05-03 09:30:00+08'),
('SHP-20260504-0006', 'ORD-TBWL-20260504-0010 / SF2000000002', '陆运', 25.000, '宠物笼 x6 + 宠物玩具 x30', -72.00, '成功', '2026-05-04 08:30:00+08'),
('SHP-20260420-0007', 'ORD-TBWL-20260420-0701 / SF5000000001', '空运', 5.600, '服装 x50 件', -95.00, '成功', '2026-04-30 16:00:00+08'),
('SHP-20260421-0008', 'ORD-TBWL-20260421-0702 / SF5000000002', '空运', 4.200, '书籍 x100 本', -68.00, '成功', '2026-05-01 15:30:00+08'),
('SHP-20260422-0009', 'ORD-TBWL-20260422-0703 / SF5000000003', '海运', 12.000, '家居装饰品 x30 件', -98.00, '成功', '2026-05-02 14:00:00+08'),
('SHP-20260423-0010', 'ORD-TBWL-20260423-0704 / SF5000000004', '空运', 6.800, '鞋类 x40 双', -122.40, '成功', '2026-05-02 17:00:00+08')
ON CONFLICT (serial_number) DO NOTHING;

-- ============================================================
-- 10. scan_register — 扫码转账登记
-- ============================================================
INSERT INTO scan_register (serial_number, payment_method, amount, remarks, status, created_at) VALUES
('SCN-20260512-001', '支付宝', 1000.00, '账户充值', '成功', '2026-05-12 14:20:00+08'),
('SCN-20260501-002', '微信支付', 500.00, '账户充值', '成功', '2026-05-01 09:15:00+08'),
('SCN-20260420-003', '支付宝', 2000.00, '账户充值', '成功', '2026-04-20 16:30:00+08'),
('SCN-20260415-004', '微信支付', 300.00, '账户充值', '成功', '2026-04-15 11:00:00+08'),
('SCN-20260410-005', '支付宝', 5000.00, '大额充值', '成功', '2026-04-10 10:00:00+08'),
('SCN-20260328-006', '支付宝', 1500.00, '账户充值', '成功', '2026-03-28 14:00:00+08'),
('SCN-20260315-007', '微信支付', 800.00, '账户充值', '成功', '2026-03-15 09:30:00+08'),
('SCN-20260305-008', '支付宝', 3000.00, '账户充值', '成功', '2026-03-05 10:00:00+08'),
('SCN-20260514-009', '微信支付', 200.00, '账户充值', '待支付', '2026-05-14 08:30:00+08'),
('SCN-20260510-010', '支付宝', 100.00, '测试充值', '失败', '2026-05-10 17:00:00+08')
ON CONFLICT (serial_number) DO NOTHING;

-- ============================================================
-- 11. order_profit — 订单利润
-- ============================================================
INSERT INTO order_profit (order_number, sales_amount, paid_amount, other_fees, logistics_cost, order_income, purchase_cost, inventory_cost, freight_cost, actual_income, created_at) VALUES
('ORD-TBWL-20260420-0701', 1580.00, 1450.00, 50.00, 95.00, 412.50, 280.00, 15.00, 45.00, 72.50, '2026-04-30 16:00:00+08'),
('ORD-TBWL-20260421-0702', 2200.00, 2050.00, 80.00, 68.00, 583.50, 420.00, 20.00, 38.00, 105.50, '2026-05-01 15:30:00+08'),
('ORD-TBWL-20260422-0703', 3500.00, 3200.00, 120.00, 98.00, 910.00, 680.00, 35.00, 55.00, 140.00, '2026-05-02 14:00:00+08'),
('ORD-TBWL-20260423-0704', 4800.00, 4500.00, 150.00, 122.40, 1282.50, 950.00, 48.00, 72.00, 212.50, '2026-05-02 17:00:00+08'),
('ORD-TBWL-20260424-0705', 6200.00, 5800.00, 200.00, 145.00, 1651.50, 1200.00, 62.00, 88.00, 301.50, '2026-05-03 12:00:00+08'),
('ORD-TBWL-20260501-0001', 1200.00, 1100.00, 40.00, 45.60, 313.50, 240.00, 12.00, 28.00, 33.50, '2026-05-02 10:00:00+08'),
('ORD-TBWL-20260501-0002', 980.00, 900.00, 30.00, 32.40, 256.50, 195.00, 9.80, 22.00, 29.70, '2026-05-02 11:30:00+08'),
('ORD-TBWL-20260416-1002', 850.00, 780.00, 25.00, 28.00, 222.00, 168.00, 8.50, 18.00, 27.50, '2026-04-22 10:00:00+08'),
('ORD-TBWL-20260417-1003', 2800.00, 2600.00, 90.00, 75.00, 741.00, 560.00, 28.00, 42.00, 111.00, '2026-04-30 14:00:00+08'),
('ORD-TBWL-20260424-1010', 3200.00, 2950.00, 100.00, 88.00, 840.00, 640.00, 32.00, 50.00, 118.00, '2026-05-02 15:00:00+08')
ON CONFLICT (order_number) DO NOTHING;

-- ============================================================
-- 12. taiwan_apply — 台湾仓发货申请
-- ============================================================
INSERT INTO taiwan_apply (member_code, product_count, manifest_type, status, remarks, created_at) VALUES
('MBR-001 / 张小明 / TW-SHIP-20260501-001', 3, '普通', '待处理', '', '2026-05-01 09:00:00+08'),
('MBR-002 / 李大华 / TW-SHIP-20260501-002', 5, '普通', '处理中', '优先发货', '2026-05-01 10:30:00+08'),
('MBR-003 / 王美丽 / TW-SHIP-20260502-003', 2, '冷链', '已发货', '冷链运输', '2026-05-02 09:00:00+08'),
('MBR-004 / 陈建国 / TW-SHIP-20260502-004', 8, '普通', '待处理', '', '2026-05-02 11:00:00+08'),
('MBR-005 / 林小燕 / TW-SHIP-20260503-005', 1, '普通', '处理中', '', '2026-05-03 08:30:00+08'),
('MBR-006 / 黄志远 / TW-SHIP-20260503-006', 4, '大件', '已发货', '大件货物', '2026-05-03 10:00:00+08'),
('MBR-007 / 刘雅婷 / TW-SHIP-20260504-007', 6, '普通', '待处理', '', '2026-05-04 09:00:00+08'),
('MBR-008 / 赵明辉 / TW-SHIP-20260504-008', 2, '普通', '已取消', '客户取消', '2026-05-04 14:00:00+08');

-- ============================================================
-- 13. abnormal_parcels — 异常包裹
-- ============================================================
INSERT INTO abnormal_parcels (tracking_number, order_number, abnormal_type, process_action, idle_days, processed_at, created_at) VALUES
('SF3000000001', 'ORD-TBWL-20260410-0501', '运输破损', '申请理赔', 35, NULL, '2026-04-10 08:00:00+08'),
('SF3000000002', 'ORD-TBWL-20260412-0502', '漏液污染', '重新包装', 33, '2026-04-22 10:00:00+08', '2026-04-12 10:00:00+08'),
('YT3000000003', 'ORD-TBWL-20260414-0503', '海关查验', '等待清关', 31, NULL, '2026-04-14 13:30:00+08'),
('',             'ORD-TBWL-20260416-0504', '保质期临近', '客户确认中', 29, NULL, '2026-04-16 09:00:00+08'),
('',             'ORD-TBWL-20260418-0505', '地址不详', '联系收件人', 27, '2026-04-25 14:00:00+08', '2026-04-18 14:00:00+08'),
('SF8000000002', 'ORD-TBWL-20260416-1002', '外包装破损', '拍照存档', 29, NULL, '2026-04-16 09:00:00+08'),
('',             'ORD-TBWL-20260420-1006', '音箱外壳破裂', '申请理赔', 25, NULL, '2026-04-20 14:00:00+08'),
('SF9900009999', 'ORD-TBWL-20260505-0001', '重量异常', '复称核实', 10, NULL, '2026-05-05 09:00:00+08');

-- ============================================================
-- 验证：各表数据量
-- ============================================================
SELECT 'inventory_products'  AS 表名, COUNT(*) AS 记录数 FROM inventory_products
UNION ALL SELECT 'unassociated_parcels', COUNT(*) FROM unassociated_parcels
UNION ALL SELECT 'recharge_records',     COUNT(*) FROM recharge_records
UNION ALL SELECT 'claims',               COUNT(*) FROM claims
UNION ALL SELECT 'inventory_apply',      COUNT(*) FROM inventory_apply
UNION ALL SELECT 'inventory_records',    COUNT(*) FROM inventory_records
UNION ALL SELECT 'returns',              COUNT(*) FROM returns
UNION ALL SELECT 'expense_records',      COUNT(*) FROM expense_records
UNION ALL SELECT 'shipping_records',     COUNT(*) FROM shipping_records
UNION ALL SELECT 'scan_register',        COUNT(*) FROM scan_register
UNION ALL SELECT 'order_profit',         COUNT(*) FROM order_profit
UNION ALL SELECT 'taiwan_apply',         COUNT(*) FROM taiwan_apply
UNION ALL SELECT 'abnormal_parcels',     COUNT(*) FROM abnormal_parcels
ORDER BY 表名;
