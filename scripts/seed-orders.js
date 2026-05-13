/**
 * 订单测试数据播种脚本
 *
 * 使用方法（二选一）：
 *
 * === 方式 A：Supabase Dashboard SQL Editor（推荐）===
 * 1. 打开 https://supabase.com/dashboard/project/jpcvuonddoeldgzhswqb
 * 2. 进入 SQL Editor
 * 3. 复制 supabase/seed_orders.sql 内容并粘贴
 * 4. 点击运行
 *
 * === 方式 B：运行此脚本（需要 Service Role Key）===
 * 1. 在 Supabase Dashboard → Project Settings → API → service_role key 复制
 * 2. 在项目根目录运行：
 *    SUPABASE_SERVICE_KEY="你的service_role_key" node scripts/seed-orders.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpcvuonddoeldgzhswqb.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!serviceKey) {
  console.error(`
[错误] 缺少 SUPABASE_SERVICE_KEY 环境变量。
请先获取 Supabase 项目的 service_role key：
  Dashboard → Project Settings → API → service_role key

然后运行：
  SUPABASE_SERVICE_KEY="你的key" node scripts/seed-orders.js
`);
  process.exit(1);
}

// 使用 service_role key（跳过 RLS）
const supabase = createClient(supabaseUrl, serviceKey);

const orders = [
  // ── 1. 待处理 ──
  { order_number: 'ORD-TBWL-20260501-0001', shipping_method: '空运', product_list: '手机壳 x50, 钢化膜 x30', remarks: '客户要求加急', status: '待处理', tracking_info: '', created_at: '2026-05-01T09:15:00+08:00', updated_at: '2026-05-01T09:15:00+08:00' },
  { order_number: 'ORD-TBWL-20260501-0002', shipping_method: '空运', product_list: '蓝牙耳机 x20, 充电线 x40', remarks: '', status: '待处理', tracking_info: '', created_at: '2026-05-01T10:30:00+08:00', updated_at: '2026-05-01T10:30:00+08:00' },
  { order_number: 'ORD-TBWL-20260501-0003', shipping_method: '海运', product_list: '收纳箱 x100, 置物架 x30', remarks: '易碎品注意包装', status: '待处理', tracking_info: '', created_at: '2026-05-01T11:00:00+08:00', updated_at: '2026-05-01T11:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260502-0004', shipping_method: '空运', product_list: '智能手表 x10, 表带 x25', remarks: '', status: '待处理', tracking_info: '', created_at: '2026-05-02T08:45:00+08:00', updated_at: '2026-05-02T08:45:00+08:00' },
  { order_number: 'ORD-TBWL-20260502-0005', shipping_method: '陆运', product_list: '办公椅 x5, 升降桌 x3', remarks: '大件货物', status: '待处理', tracking_info: '', created_at: '2026-05-02T09:20:00+08:00', updated_at: '2026-05-02T09:20:00+08:00' },
  { order_number: 'ORD-TBWL-20260502-0006', shipping_method: '空运', product_list: '护肤品套装 x15, 面膜 x60', remarks: '', status: '待处理', tracking_info: '', created_at: '2026-05-02T14:10:00+08:00', updated_at: '2026-05-02T14:10:00+08:00' },
  { order_number: 'ORD-TBWL-20260503-0007', shipping_method: '海运', product_list: '户外帐篷 x8, 睡袋 x12', remarks: '', status: '待处理', tracking_info: '', created_at: '2026-05-03T07:30:00+08:00', updated_at: '2026-05-03T07:30:00+08:00' },
  { order_number: 'ORD-TBWL-20260503-0008', shipping_method: '空运', product_list: '平板保护套 x40, 键盘 x10', remarks: '', status: '待处理', tracking_info: '', created_at: '2026-05-03T09:00:00+08:00', updated_at: '2026-05-03T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260503-0009', shipping_method: '空运', product_list: '运动鞋 x12 双, 袜子 x50 双', remarks: '尺码需二次确认', status: '待处理', tracking_info: '', created_at: '2026-05-03T10:15:00+08:00', updated_at: '2026-05-03T10:15:00+08:00' },
  { order_number: 'ORD-TBWL-20260504-0010', shipping_method: '陆运', product_list: '宠物笼 x6, 宠物玩具 x30', remarks: '', status: '待处理', tracking_info: '', created_at: '2026-05-04T08:00:00+08:00', updated_at: '2026-05-04T08:00:00+08:00' },

  // ── 2. 已提交/待打包 ──
  { order_number: 'ORD-TBWL-20260428-0101', shipping_method: '空运', product_list: 'LED 灯带 x100, 灯泡 x60', remarks: '', status: '已提交/待打包', tracking_info: '', created_at: '2026-04-28T13:00:00+08:00', updated_at: '2026-04-29T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260428-0102', shipping_method: '空运', product_list: 'USB 集线器 x30, 充电头 x50', remarks: '需要贴标', status: '已提交/待打包', tracking_info: '', created_at: '2026-04-28T14:20:00+08:00', updated_at: '2026-04-29T10:30:00+08:00' },
  { order_number: 'ORD-TBWL-20260429-0103', shipping_method: '海运', product_list: '陶瓷餐具套装 x20, 杯子 x80', remarks: '易碎品，加厚泡沫', status: '已提交/待打包', tracking_info: '', created_at: '2026-04-29T09:30:00+08:00', updated_at: '2026-04-30T08:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260429-0104', shipping_method: '空运', product_list: '无线鼠标 x25, 鼠标垫 x25', remarks: '', status: '已提交/待打包', tracking_info: '', created_at: '2026-04-29T11:45:00+08:00', updated_at: '2026-04-30T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260430-0105', shipping_method: '空运', product_list: '儿童绘本 x200 本', remarks: '分 4 箱包装', status: '已提交/待打包', tracking_info: '', created_at: '2026-04-30T08:15:00+08:00', updated_at: '2026-05-01T10:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260430-0106', shipping_method: '陆运', product_list: '瑜伽垫 x30, 哑铃套装 x10', remarks: '', status: '已提交/待打包', tracking_info: '', created_at: '2026-04-30T15:00:00+08:00', updated_at: '2026-05-01T08:30:00+08:00' },
  { order_number: 'ORD-TBWL-20260501-0107', shipping_method: '空运', product_list: '电脑背包 x15, 腰包 x20', remarks: '', status: '已提交/待打包', tracking_info: '', created_at: '2026-05-01T16:30:00+08:00', updated_at: '2026-05-02T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260501-0108', shipping_method: '海运', product_list: '折叠桌椅套装 x10', remarks: '偏远地区', status: '已提交/待打包', tracking_info: '', created_at: '2026-05-01T17:00:00+08:00', updated_at: '2026-05-02T10:00:00+08:00' },

  // ── 3. 转运中 ──
  { order_number: 'ORD-TBWL-20260420-0201', shipping_method: '空运', product_list: '电子元器件 x500 pcs', remarks: '', status: '转运中', tracking_info: 'SF1234567890', created_at: '2026-04-20T10:00:00+08:00', updated_at: '2026-04-25T08:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260421-0202', shipping_method: '空运', product_list: '化妆品 x30, 化妆刷 x50', remarks: '', status: '转运中', tracking_info: 'SF1234567891', created_at: '2026-04-21T09:30:00+08:00', updated_at: '2026-04-26T14:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260422-0203', shipping_method: '海运', product_list: '家具配件 x200 kg', remarks: '重货', status: '转运中', tracking_info: 'YT9876543210', created_at: '2026-04-22T11:15:00+08:00', updated_at: '2026-04-28T06:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260423-0204', shipping_method: '空运', product_list: '相机镜头 x5, 三脚架 x8', remarks: '精密仪器', status: '转运中', tracking_info: 'SF1234567892', created_at: '2026-04-23T14:00:00+08:00', updated_at: '2026-04-27T10:30:00+08:00' },
  { order_number: 'ORD-TBWL-20260424-0205', shipping_method: '陆运', product_list: '自行车 x6 辆', remarks: '', status: '转运中', tracking_info: 'SF1234567893', created_at: '2026-04-24T08:00:00+08:00', updated_at: '2026-04-29T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260425-0206', shipping_method: '空运', product_list: '游戏手柄 x15, 耳机 x15', remarks: '', status: '转运中', tracking_info: 'YT1230987654', created_at: '2026-04-25T16:45:00+08:00', updated_at: '2026-04-30T11:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260426-0207', shipping_method: '海运', product_list: '厨房电器套装 x25', remarks: '', status: '转运中', tracking_info: 'SF1234567894', created_at: '2026-04-26T09:00:00+08:00', updated_at: '2026-05-01T08:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260427-0208', shipping_method: '空运', product_list: '保健品 x100 瓶', remarks: '食品级包装', status: '转运中', tracking_info: 'SF1234567895', created_at: '2026-04-27T10:30:00+08:00', updated_at: '2026-05-02T09:30:00+08:00' },

  // ── 4. 预刷件 ──
  { order_number: 'ORD-TBWL-20260501-0301', shipping_method: '空运', product_list: 'T 恤 x100 件', remarks: '预刷单，等待实物', status: '预刷件', tracking_info: 'SF2000000001', created_at: '2026-05-01T08:00:00+08:00', updated_at: '2026-05-01T08:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260501-0302', shipping_method: '空运', product_list: '马克杯 x60, 保温杯 x20', remarks: '', status: '预刷件', tracking_info: 'SF2000000002', created_at: '2026-05-01T09:00:00+08:00', updated_at: '2026-05-01T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260502-0303', shipping_method: '空运', product_list: '文具套装 x100', remarks: '', status: '预刷件', tracking_info: 'SF2000000003', created_at: '2026-05-02T10:00:00+08:00', updated_at: '2026-05-02T10:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260502-0304', shipping_method: '空运', product_list: '毛绒玩具 x30 个', remarks: '', status: '预刷件', tracking_info: 'SF2000000004', created_at: '2026-05-02T11:00:00+08:00', updated_at: '2026-05-02T11:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260503-0305', shipping_method: '空运', product_list: '数据线 x200 条', remarks: '', status: '预刷件', tracking_info: 'SF2000000005', created_at: '2026-05-03T08:30:00+08:00', updated_at: '2026-05-03T08:30:00+08:00' },

  // ── 5. 取消中 ──
  { order_number: 'ORD-TBWL-20260415-0401', shipping_method: '空运', product_list: '服装 x30 件', remarks: '客户申请取消', status: '取消中', tracking_info: '', created_at: '2026-04-15T14:00:00+08:00', updated_at: '2026-04-20T10:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260418-0402', shipping_method: '海运', product_list: '家具 x5 件', remarks: '地址变更取消', status: '取消中', tracking_info: '', created_at: '2026-04-18T09:30:00+08:00', updated_at: '2026-04-22T08:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260420-0403', shipping_method: '空运', product_list: '电子产品 x10', remarks: '重复订单取消', status: '取消中', tracking_info: '', created_at: '2026-04-20T11:00:00+08:00', updated_at: '2026-04-25T14:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260422-0404', shipping_method: '空运', product_list: '鞋类 x15 双', remarks: '', status: '取消中', tracking_info: '', created_at: '2026-04-22T15:30:00+08:00', updated_at: '2026-04-26T09:00:00+08:00' },

  // ── 6. 异常件 ──
  { order_number: 'ORD-TBWL-20260410-0501', shipping_method: '空运', product_list: '精密仪器 x2', remarks: '运输中破损，待理赔', status: '异常件', tracking_info: 'SF3000000001', created_at: '2026-04-10T08:00:00+08:00', updated_at: '2026-04-18T15:30:00+08:00' },
  { order_number: 'ORD-TBWL-20260412-0502', shipping_method: '空运', product_list: '液体产品 x50 瓶', remarks: '漏液，需重新包装', status: '异常件', tracking_info: 'SF3000000002', created_at: '2026-04-12T10:00:00+08:00', updated_at: '2026-04-19T11:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260414-0503', shipping_method: '海运', product_list: '大型设备 x1', remarks: '海关查验中', status: '异常件', tracking_info: 'YT3000000003', created_at: '2026-04-14T13:30:00+08:00', updated_at: '2026-04-20T08:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260416-0504', shipping_method: '空运', product_list: '食品 x200 包', remarks: '保质期临近，需确认', status: '异常件', tracking_info: '', created_at: '2026-04-16T09:00:00+08:00', updated_at: '2026-04-21T14:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260418-0505', shipping_method: '陆运', product_list: '家电 x4 台', remarks: '地址不详，联系中', status: '异常件', tracking_info: '', created_at: '2026-04-18T14:00:00+08:00', updated_at: '2026-04-23T10:30:00+08:00' },

  // ── 7. 待确认入店 ──
  { order_number: 'ORD-TBWL-20260425-0601', shipping_method: '空运', product_list: '冬季外套 x20 件', remarks: '', status: '待确认入店', tracking_info: 'SF4000000001', created_at: '2026-04-25T08:00:00+08:00', updated_at: '2026-05-03T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260426-0602', shipping_method: '空运', product_list: '背包 x15 个', remarks: '', status: '待确认入店', tracking_info: 'SF4000000002', created_at: '2026-04-26T09:00:00+08:00', updated_at: '2026-05-03T10:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260427-0603', shipping_method: '空运', product_list: '手工艺品 x30 件', remarks: '', status: '待确认入店', tracking_info: 'SF4000000003', created_at: '2026-04-27T10:00:00+08:00', updated_at: '2026-05-03T11:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260428-0604', shipping_method: '空运', product_list: '玩具 x40 盒', remarks: '', status: '待确认入店', tracking_info: 'SF4000000004', created_at: '2026-04-28T11:00:00+08:00', updated_at: '2026-05-03T12:00:00+08:00' },

  // ── 8. 已送店 ──
  { order_number: 'ORD-TBWL-20260420-0701', shipping_method: '空运', product_list: '服装 x50 件', remarks: '已送达门店', status: '已送店', tracking_info: 'SF5000000001', created_at: '2026-04-20T08:00:00+08:00', updated_at: '2026-04-30T16:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260421-0702', shipping_method: '空运', product_list: '书籍 x100 本', remarks: '', status: '已送店', tracking_info: 'SF5000000002', created_at: '2026-04-21T09:00:00+08:00', updated_at: '2026-05-01T15:30:00+08:00' },
  { order_number: 'ORD-TBWL-20260422-0703', shipping_method: '海运', product_list: '家居装饰品 x30 件', remarks: '', status: '已送店', tracking_info: 'SF5000000003', created_at: '2026-04-22T10:00:00+08:00', updated_at: '2026-05-02T14:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260423-0704', shipping_method: '空运', product_list: '鞋类 x40 双', remarks: '', status: '已送店', tracking_info: 'SF5000000004', created_at: '2026-04-23T11:00:00+08:00', updated_at: '2026-05-02T17:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260424-0705', shipping_method: '空运', product_list: '日用百货 x80 件', remarks: '', status: '已送店', tracking_info: 'SF5000000005', created_at: '2026-04-24T08:30:00+08:00', updated_at: '2026-05-03T12:00:00+08:00' },

  // ── 9. 退件重发 ──
  { order_number: 'ORD-TBWL-20260401-0801', shipping_method: '空运', product_list: '耳机 x10', remarks: '原单退回，重发中', status: '退件重发', tracking_info: 'SF6000000001', created_at: '2026-04-01T08:00:00+08:00', updated_at: '2026-04-20T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260405-0802', shipping_method: '空运', product_list: '充电宝 x20', remarks: '原单损坏，补发', status: '退件重发', tracking_info: 'SF6000000002', created_at: '2026-04-05T09:00:00+08:00', updated_at: '2026-04-22T10:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260408-0803', shipping_method: '空运', product_list: '服饰 x25 件', remarks: '尺码不符退回重发', status: '退件重发', tracking_info: 'SF6000000003', created_at: '2026-04-08T10:00:00+08:00', updated_at: '2026-04-25T11:00:00+08:00' },

  // ── 10. 已关闭 ──
  { order_number: 'ORD-TBWL-20260301-0901', shipping_method: '空运', product_list: '数码配件 x30', remarks: '', status: '已关闭', tracking_info: 'SF7000000001', created_at: '2026-03-01T08:00:00+08:00', updated_at: '2026-03-15T10:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260305-0902', shipping_method: '海运', product_list: '家居用品 x50', remarks: '', status: '已关闭', tracking_info: 'SF7000000002', created_at: '2026-03-05T09:00:00+08:00', updated_at: '2026-03-28T16:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260310-0903', shipping_method: '空运', product_list: '运动装备 x20', remarks: '客户取消订单', status: '已关闭', tracking_info: '', created_at: '2026-03-10T10:00:00+08:00', updated_at: '2026-03-12T14:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260315-0904', shipping_method: '空运', product_list: '美容仪器 x5', remarks: '', status: '已关闭', tracking_info: 'SF7000000004', created_at: '2026-03-15T11:00:00+08:00', updated_at: '2026-04-01T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260320-0905', shipping_method: '陆运', product_list: '健身器材 x8', remarks: '', status: '已关闭', tracking_info: 'SF7000000005', created_at: '2026-03-20T08:30:00+08:00', updated_at: '2026-04-10T15:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260325-0906', shipping_method: '空运', product_list: '礼品套装 x15', remarks: '', status: '已关闭', tracking_info: 'SF7000000006', created_at: '2026-03-25T09:30:00+08:00', updated_at: '2026-04-15T11:00:00+08:00' },

  // ── 11. 混合 ──
  { order_number: 'ORD-TBWL-20260415-1001', shipping_method: '空运', product_list: '手机 x5, 平板 x2', remarks: '', status: '待处理', tracking_info: '', created_at: '2026-04-15T08:00:00+08:00', updated_at: '2026-04-15T08:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260416-1002', shipping_method: '空运', product_list: '键盘 x10, 鼠标 x10', remarks: '', status: '转运中', tracking_info: 'SF8000000002', created_at: '2026-04-16T09:00:00+08:00', updated_at: '2026-04-22T10:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260417-1003', shipping_method: '空运', product_list: '显示器 x3', remarks: '', status: '已送店', tracking_info: 'SF8000000003', created_at: '2026-04-17T10:00:00+08:00', updated_at: '2026-04-30T14:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260418-1004', shipping_method: '空运', product_list: '打印机 x2, 墨盒 x10', remarks: '', status: '已提交/待打包', tracking_info: '', created_at: '2026-04-18T11:00:00+08:00', updated_at: '2026-04-20T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260419-1005', shipping_method: '空运', product_list: '投影仪 x1, 幕布 x1', remarks: '预订设备', status: '预刷件', tracking_info: 'SF8000000005', created_at: '2026-04-19T13:00:00+08:00', updated_at: '2026-04-19T13:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260420-1006', shipping_method: '空运', product_list: '音箱 x6', remarks: '', status: '异常件', tracking_info: '', created_at: '2026-04-20T14:00:00+08:00', updated_at: '2026-04-25T08:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260421-1007', shipping_method: '空运', product_list: '路由器 x10, 交换机 x2', remarks: '', status: '取消中', tracking_info: '', created_at: '2026-04-21T15:00:00+08:00', updated_at: '2026-04-26T10:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260422-1008', shipping_method: '空运', product_list: '耳机 x20', remarks: '', status: '待确认入店', tracking_info: 'SF8000000008', created_at: '2026-04-22T16:00:00+08:00', updated_at: '2026-05-01T09:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260423-1009', shipping_method: '空运', product_list: '智能家居套装 x5', remarks: '', status: '退件重发', tracking_info: 'SF8000000009', created_at: '2026-04-23T08:00:00+08:00', updated_at: '2026-05-01T10:00:00+08:00' },
  { order_number: 'ORD-TBWL-20260424-1010', shipping_method: '空运', product_list: '手表 x8', remarks: '', status: '已关闭', tracking_info: 'SF8000000010', created_at: '2026-04-24T09:00:00+08:00', updated_at: '2026-05-02T15:00:00+08:00' },
];

async function main() {
  console.log(`准备插入 ${orders.length} 条订单测试数据...\n`);

  // 分批插入，每批 20 条
  const BATCH_SIZE = 20;
  for (let i = 0; i < orders.length; i += BATCH_SIZE) {
    const batch = orders.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('orders').insert(batch);

    if (error) {
      console.error(`[错误] 批次 ${i / BATCH_SIZE + 1}:`, error.message);
      process.exit(1);
    }
    console.log(`  ✓ 批次 ${i / BATCH_SIZE + 1} 完成: ${batch.length} 条`);
  }

  // 统计各状态数量
  const { data: stats } = await supabase
    .from('orders')
    .select('status')
    .in('status', [
      '待处理', '已提交/待打包', '转运中', '预刷件', '取消中',
      '异常件', '待确认入店', '已送店', '退件重发', '已关闭',
    ]);

  if (stats) {
    /** @type {Object<string,number>} */
    const counts = {};
    stats.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    console.log('\n各状态数据量:');
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([s, c]) => console.log(`  ${s}: ${c} 条`));
    console.log(`\n总计: ${stats.length} 条`);
  }

  console.log('\n✓ 测试数据播种完成！');
}

main().catch(console.error);
