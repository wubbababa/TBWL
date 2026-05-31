-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  detail TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_operation_logs_created_at ON operation_logs (created_at DESC);
CREATE INDEX idx_operation_logs_module ON operation_logs (module);

-- RLS
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read logs"
  ON operation_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert logs"
  ON operation_logs FOR INSERT
  TO service_role
  USING (true);

-- 示例数据
INSERT INTO operation_logs (user_email, action, module, detail) VALUES
  ('admin@tbwl.com', '创建账号', '账号', '创建用户 test@example.com'),
  ('admin@tbwl.com', '修改订单状态', '订单', '订单 ORD-20260501-001 状态变更为「转运中」'),
  ('admin@tbwl.com', '导出数据', '订单', '导出 CSV 共 156 条记录'),
  ('admin@tbwl.com', '禁用账号', '账号', '禁用用户 old@example.com'),
  ('admin@tbwl.com', '修改密码', '系统', NULL);
