# TBWL 客户端贴单ERP系统 — CodeMap

> 生成日期: 2026-05-21
> 技术栈: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Supabase

---

## 1. 项目概览

```
TBWL (客户端贴单ERP系统)
├── 类型: B2B 企业级 Web ERP — 仓储/订单/资金管理
├── 状态: 🏗 基础架构已完成，核心流程可用，部分模块待完善
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
| `/api/admin/create-user` | POST | 管理员创建新用户 (service_role) |
| `/api/account-stats` | GET | 账户余额/消费/充值汇总 |

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

### 4.3 数据流模式

所有页面遵循一致的 **客户端组件 + Supabase 直连** 模式:

```
页面组件 (page.tsx)
  ├── useState → 筛选条件 / 数据状态
  ├── useEffect → supabase.from('table').select('*') 初始化加载
  ├── 事件处理 → supabase 查询/变更
  └── 渲染 → 筛选表单 + 数据表格 + 操作按钮
```

关键特征:
- 全部为 `'use client'` 组件（SSR 未使用）
- 数据获取: Supabase JS SDK 浏览器端直连
- 无状态管理库、无 React Query、无 SWR
- 批量操作通过 `supabase.rpc` 或逐行 `update/delete`

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

### 5.2 工具库 (`src/lib/`)

| 文件 | 导出 | 用途 |
|---|---|---|
| `supabase.ts` | `supabase` 客户端实例 | 浏览器端 Supabase 客户端 (SSR cookies) |
| `auth.ts` | `useAuth()` hook | 用户会话状态 + 登出 |
| `csv.ts` | 5个函数 + 4个常量 | CSV 列的Schema定义、解析、生成、下载、模板生成 |

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

| 优先级 | 问题 | 影响 |
|---|---|---|
| **P0** | 无访问控制 | 任何人打开 URL 即可看到所有数据 |
| **P1** | 订单详情/状态操作缺失 | 订单"详情"按钮无响应，批量操作为空壳 |
| **P2** | 首页数据硬编码 | 余额/累计消费/充值全部为 0 |
| **P3** | 创建/编辑表单未实现 | 库存商品/入库申请等"创建"按钮空壳 |
| **P4** | 无分页 | 表格一次性加载全部数据 |
| **P5** | 系统管理未实现 | 账号管理/操作日志等纯展示卡片 |

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

1. **安全性风险**: 当前无 RBAC/权限控制，所有认证用户可访问全部数据
2. **性能风险**: 所有表格无分页，随数据增长将显著变慢
3. **可维护性**: 页面级代码重复度高 — 每个页面独立编写筛选/查询/表格逻辑，推荐提取通用 CRUD 模板
4. **错误处理**: 大部分页面有 try/catch 但缺少用户友好的错误提示 UI
5. **SSR 未启用**: 全部 `'use client'` 不利于 SEO 和首屏性能
