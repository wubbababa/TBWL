# TBWL 客户端贴单ERP系统 — CodeMap

> 生成日期: 2026-05-31
> 技术栈: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Supabase

---

## 1. 项目概览

```
TBWL (客户端贴单ERP系统)
├── 类型: B2B 企业级 Web ERP — 仓储/订单/资金管理
├── 状态: 🟢 核心功能完整，安全加固已完成，分页已全面接入
├── 用户: 跨境仓储企业客户（面向中国—台湾物流链路）
├── 运行: pnpm dev → localhost:3000
└── 部署: Vercel (已关联项目)
```

### 技术栈速览

| 层 | 技术 | 版本 |
|---|---|---|
| 框架 | Next.js (App Router) | 16.2.1 |
| UI | React | 19.2.4 |
| 语言 | TypeScript / TSX | ~5.x |
| 样式 | Tailwind CSS v4 | 4.x |
| 图标 | Lucide React | 1.7.0 |
| 数据库 | Supabase (Postgres) | @supabase/supabase-js 2.105.4 |
| 认证 | Supabase Auth (SSR Cookies) | @supabase/ssr 0.10.3 |
| 图片优化 | next/image | 内置 |

---

## 2. 目录结构

```
f:/projects/TBWL/
├── .env.local                    # Supabase 凭据 (URL + anon key + service_role key)
├── package.json                  # 依赖与脚本
├── tsconfig.json                 # strict: true, path alias: @/*
├── next.config.ts                # 空配置（默认）
├── postcss.config.mjs            # Tailwind CSS v4 PostCSS 插件
├── eslint.config.mjs             # eslint-config-next (core-web-vitals + typescript)
├── CLAUDE.md                     # OMC 编排配置
├── AGENTS.md                     # Next.js agent rules
├── project_analysis.md           # 前期项目分析
├── todo.txt                      # 优先级待办 (P0-P5)
├── codemap.md                    # ← 本文档
│
├── src/                          # 应用源码
│   ├── app/                      # Next.js App Router 页面
│   ├── components/               # 可复用组件
│   ├── lib/                      # 工具库
│   └── constants/                # 常量配置
│
├── supabase/                     # 数据库迁移与种子数据
│   ├── migrations.sql            # 基础表结构
│   ├── seed_all_modules.sql      # 全模块测试数据
│   └── seed_orders.sql           # 订单种子数据 (11种状态全覆盖)
│
├── scripts/
│   └── seed-orders.js            # 订单数据播种脚本 (Node.js)
│
└── 参考图/                       # UI 设计参考截图 (23张)
```

---

## 3. 路由结构 (App Router)

### 3.1 布局层级

```
RootLayout (src/app/layout.tsx)
├── AppShell (客户端组件)
│   ├── Sidebar        ← 左侧导航菜单
│   ├── Navbar         ← 顶部栏 (全屏/通知/用户)
│   ├── BreadcrumbBar  ← 标签页导航 + 面包屑
│   └── <main>         ← 页面内容
│
LoginLayout (src/app/login/layout.tsx)
  └── 无 Shell，纯登录页
```

### 3.2 路由清单

| 路径 | 页面 | 功能 |
|---|---|---|
| `/` | 首页 | `redirect('/home')` |
| `/login` | 登录页 | Supabase Auth 邮箱密码登录 |
| `/home` | 控制台首页 | 统计卡片 (订单/资金概览) |
| `/orders` | **订单管理** | 订单列表+筛选+详情+批量操作+CSV导入导出 |
| `/abnormal` | 异常包裹 | 异常件处理中心 |
| `/profit` | 订单利润 | 利润统计面板 |
| `/unassociated` | 未关联包裹 | 包裹—订单关联管理 |
| `/inventory/products` | 库存商品 | 仓内商品列表 |
| `/inventory/apply` | 申请入库 | 入库申请记录 |
| `/inventory/records` | 库存调用记录 | 库存变动日志 |
| `/inventory/database` | 商品库 | 商品主数据 |
| `/taiwan/products` | 台湾库存商品 | 台北仓/台中仓/高雄仓 |
| `/taiwan/apply` | 台湾申请入库 | 台湾仓发货申请 |
| `/taiwan/records` | 台湾调用记录 | 台湾仓库存变动 |
| `/taiwan/database` | 台湾商品库 | 台湾各仓商品主数据 |
| `/funds/expense` | 消费明细 | 资金支出记录 |
| `/funds/shipping` | 物流明细 | 运输费用明细 |
| `/funds/recharge` | 账户充值 | 在线充值 (支付宝/微信) |
| `/funds/scan-register` | 扫码登记 | 扫码转账登记 |
| `/other/returns` | 退件包裹 | 退货管理 |
| `/other/return-register` | 退件登记 | 手动录入退件 |
| `/other/parcel-claim` | 包裹认领 | 无主件认领流程 |
| `/other/claims` | 索赔登记 | 损毁/丢失索赔 |
| `/system` | 系统管理 | 设置面板 (账号/安全/通知/备份) |
| `/system/users` | 账号管理 | 创建用户 (调用 admin API) |

### 3.3 API 路由

| 路径 | 方法 | 功能 |
|---|---|---|
| `/api/admin/create-user` | POST | 管理员创建新用户 (service_role + role 鉴权) |
| `/api/admin/list-users` | GET | 列出所有用户 |
| `/api/admin/toggle-user` | POST | 启用/禁用用户 |
| `/api/account-stats` | GET | 账户余额/消费/充值汇总 (需认证) |

---

## 4. 组件架构

### 4.1 布局组件 (`src/components/layout/`)

| 组件 | 职责 |
|---|---|
| `AppShell` | 布局壳 — 登录页/主应用分流 |
| `LayoutContext` | React Context — 侧边栏折叠/多标签页管理 |
| `Sidebar` | 左侧导航 — 菜单树 + 搜索过滤 + 用户信息 |
| `Navbar` | 顶栏 — 侧边栏折叠/全屏/通知铃/用户下拉/登出 |
| `BreadcrumbBar` | 标签页栏 — 多标签切换 + 关闭 |

### 4.2 订单模块组件 (`src/components/orders/`)

| 组件 | 职责 |
|---|---|
| `OrderTabs` | 订单状态标签 (11种状态) |
| `FilterForm` | 多维度筛选表单 (12个字段) |
| `OrderTable` | 订单数据表格 + 多选 + 分页 |
| `OrderDetailModal` | 订单详情弹窗 + 状态变更 + 追踪号编辑 |
| `CsvImportModal` | CSV 导入 (上传→预览→确认→写入) |
| `ActionButtons` | 批量操作工具栏 (导出/导入模板/删除/状态批量变更) |

### 4.3 通用 UI 组件 (`src/components/ui/`)

| 组件 | 职责 |
|---|---|
| `DataTable<T>` | 通用数据表格 — 列定义/加载态/空态/错误态/分页UI/复选框 |

### 4.4 数据流模式

所有页面遵循一致的 **客户端组件 + Supabase 直连** 模式:

```
列表页面 (page.tsx) — 通用模式
  ├── useTableQuery<T>() → 分页数据 + loading + error + total
  ├── useState → 筛选条件
  ├── useCallback → filterFn (筛选逻辑)
  └── 渲染 → 筛选表单 + <DataTable> + 分页控件

订单页面 (特殊) — 自定义实现
  ├── OrderTable 组件内置分页 (PAGE_SIZE=20, range + count:exact)
  ├── 可选列探测 (probe optional columns)
  └── 全部 12 个筛选维度接入
```

关键特征:
- 全部为 `'use client'` 组件（SSR 未使用）
- 数据获取: Supabase JS SDK 浏览器端直连 + 服务端分页
- 通用列表页使用 `useTableQuery` + `DataTable` 模板（消除重复）
- 订单模块有独立的高级实现（多选/批量操作/CSV导入导出）

---

## 5. 数据层

### 5.1 Supabase 数据库表

| 表名 | 用途 | 主要字段 |
|---|---|---|
| `orders` | 订单主表 | order_number, status(11种), shipping_method, tracking_info |
| `abnormal_parcels` | 异常包裹 | tracking_number, abnormal_type, process_action, idle_days |
| `inventory_products` | 库存商品 | store_name, sku, price, total_count, remaining_count, idle_days |
| `inventory_apply` | 入库申请 | barcode, warehouse, tracking_number, sku, quantity, status |
| `inventory_records` | 库存调用记录 | product_id, order_number, sku, quantity, description |
| `unassociated_parcels` | 未关联包裹 | tracking_number, weight, volume, status |
| `returns` | 退件包裹 | tracking_number, original_order, reason, status |
| `claims` | 索赔 | order_number, tracking_number, reason, claim_amount, status |
| `recharge_records` | 充值记录 | amount, method, status |
| `expense_records` | 消费记录 | serial_number, expense_type, reference, points |
| `shipping_records` | 运输费记录 | serial_number, reference, shipping_method, weight, points |
| `scan_register` | 扫码登记 | serial_number, payment_method, amount |
| `taiwan_apply` | 台湾发货申请 | member_code, product_count, manifest_type, status |
| `taiwan_parcels` | 台湾包裹 | (在 seed_all_modules.sql 中定义完整结构) |
| `operation_logs` | 操作日志 | user_email, action, module, detail, ip_address |
| `order_profit` | 订单利润 | order_number, sales_amount, paid_amount, actual_income |

### 5.2 工具库 (`src/lib/`)

| 文件 | 导出 | 用途 |
|---|---|---|
| `supabase.ts` | `supabase` 客户端实例 | 浏览器端 Supabase 客户端 (SSR cookies) |
| `auth.ts` | `useAuth()` hook | 用户会话状态 + 登出 |
| `csv.ts` | 5个函数 + 4个常量 | CSV 列的Schema定义、解析、生成、下载、模板生成 |
| `useTableQuery.ts` | `useTableQuery<T>()` hook | 通用表格数据获取 — 分页/排序/筛选/错误处理/自动重置页码 |
| `waybill.ts` | 面单相关工具函数 | 面单上传/下载/批量操作 |

### 5.3 认证与路由守卫

```
proxy.ts (Middleware)
  ├── 拦截所有请求 (除 _next/static 等静态资源)
  ├── /login → 放行
  ├── 检查 sb-*-auth-token cookie
  └── 无 cookie → redirect /login
```

---

## 6. 常量配置

### 6.1 菜单结构 (`src/constants/menu.ts`)

一级菜单 10 项，其中 5 项有子菜单:

```
首页          /home
系统管理      /system          ┐ 账号管理 /system/users
未关联包裹    /unassociated     │
订单管理      /orders           │
异常包裹      /abnormal         │
订单利润      /profit           │
库存管理      /inventory       ┐ 库存商品 /inventory/products
                              │ 申请入库 /inventory/apply
                              │ 库存调用记录 /inventory/records
                              │ 商品库 /inventory/database
台湾仓储      /taiwan          ┐ 台湾库存商品 /taiwan/products
                              │ 台湾申请入库 /taiwan/apply
                              │ 台湾库存记录 /taiwan/records
                              │ 台湾商品库 /taiwan/database
其他管理      /other           ┐ 退件包裹 /other/returns
                              │ 退件登记 /other/return-register
                              │ 包裹认领 /other/parcel-claim
                              │ 索赔登记 /other/claims
资金管理      /funds           ┐ 消费明细 /funds/expense
                              │ 物流明细 /funds/shipping
                              │ 账户充值 /funds/recharge
                              │ 扫码登记 /funds/scan-register
安全退出      /logout
```

### 6.2 订单状态 (11种)

```
待处理 → 已提交/待打包 → 转运中 → 预刷件 → 取消中 → 异常件
→ 待确认入店 → 已送店 → 退件重发 → 已关闭
```

---

## 7. 已知问题与待办 (来自 todo.txt)

| 优先级 | 问题 | 状态 |
|---|---|---|
| **P0** | 访问控制 / RLS | ✅ 已修复 — proxy.ts 真实 JWT 校验 + orders RLS 启用 |
| **P1** | 订单详情/状态操作 | ✅ 已完成 — 详情弹窗/编辑/删除/批量操作/面单/CSV |
| **P2** | 首页数据硬编码 | ✅ 已完成 — /api/account-stats 真实聚合 |
| **P3** | 创建/编辑表单 | ✅ 已完成 — 库存/入库/台湾发货创建弹窗 |
| **P4** | 分页 | ✅ 已完成 — 全部列表页接入 useTableQuery 分页 |
| **P5** | 系统管理 | ✅ 已完成 — 密码修改/操作日志/账号管理 |

### 剩余优化方向

- 库存商品/台湾商品页面仍为手写表格（有自定义图片列），未迁移到 DataTable
- `inventory/apply` 有 CreateModal 回调依赖，保留原有模式
- 4 处 `<img>` 已替换为 `next/image`，需确保 Supabase Storage 图片 URL 可访问

---

## 8. 代码风格与约定

- **全部 `'use client'`** — 31 个页面/组件均为客户端组件
- **Supabase 浏览器直连** — 无 API 中间层 (除 admin create-user)
- **命名** — PascalCase 组件, camelCase 变量, kebab-case 文件/路由
- **路径别名** — `@/` → `./src/`
- **样式** — Tailwind CSS v4 utility classes + CSS 变量主题色
- **颜色体系** — 侧边栏 `#222d32`, 主题绿 `#228b22`, 内容背景 `#ecf0f5`

---

## 9. Supabase 配置

```
Project URL: https://jpcvuonddoeldgzhswqb.supabase.co
Auth: 邮箱+密码登录 (默认开启 email_confirm: true)
RLS: 部分表已启用 (inventory_products, unassociated_parcels)，策略为 public read
```

### 环境变量 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL      → Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY → 客户端匿名密钥
SUPABASE_SERVICE_ROLE_KEY     → 服务端管理员密钥 (仅 admin API 使用)
```

---

## 10. 架构决策记录

| 决策 | 选择 | 考虑过 |
|---|---|---|
| 数据获取模式 | 浏览器端 Supabase SDK 直连 | API Routes, tRPC, React Query |
| 路由守卫 | Middleware cookie 检测 | 服务端 RLS, 中间件 Session 验证 |
| 状态管理 | React Context + useState | Zustand, Jotai, Redux |
| CSS 方案 | Tailwind CSS v4 | CSS Modules, styled-components |
| 认证 | Supabase Auth (SSR cookies) | NextAuth.js, Clerk |
| 部署 | Vercel | Docker, 自建 VPS |

---

## 11. 风险与建议

1. ~~**安全性风险**: 当前无 RBAC/权限控制~~ → ✅ 已修复（RLS + JWT 校验 + 角色鉴权）
2. ~~**性能风险**: 所有表格无分页~~ → ✅ 已修复（全部列表页接入分页）
3. ~~**可维护性**: 页面级代码重复度高~~ → ✅ 已修复（useTableQuery + DataTable 通用模板）
4. **错误处理**: ✅ 已添加全局 error.tsx 错误边界 + useTableQuery 内置 error 状态
5. **SSR 未启用**: 全部 `'use client'` 不利于 SEO 和首屏性能（ERP 系统可接受）

### 代码质量

- ESLint: **0 errors, 0 warnings** (从 39 个问题修复至 0)
- TypeScript: strict mode, 0 errors
- next build: 成功，31 个路由全部正确构建
