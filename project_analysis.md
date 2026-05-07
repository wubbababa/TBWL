# TBWL 项目分析报告

## 1. 项目概况
**项目名称**: TBWL (客户端贴单ERP系统)
**项目类型**: Web 端企业资源规划 (ERP) 系统
**当前状态**: 基础架构已搭建，包含资金和订单管理核心模块。

## 2. 技术栈
- **核心框架**: [Next.js](https://nextjs.org/) (App Router)
- **UI 框架**: [React 19](https://react.dev/)
- **开发语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式处理**: [Tailwind CSS v4](https://tailwindcss.com/)
- **图标库**: [Lucide React](https://lucide.dev/)
- **后端/数据库**: [Supabase](https://supabase.com/)

## 3. 目录结构分析
```text
f:/projects/TBWL
├── .env.local           # 环境变量
├── package.json         # 项目依赖与脚本
├── tsconfig.json        # TypeScript 配置
├── src/
│   ├── app/             # Next.js 路由
│   │   ├── funds/       # 资金模块
│   │   ├── orders/      # 订单管理模块
│   │   ├── layout.tsx   # 全局布局 (Sidebar, Navbar)
│   │   └── page.tsx     # 首页 (重定向至资金登记)
│   ├── components/      # 组件库
│   ├── lib/             # 工具函数 (supabase.ts)
│   └── constants/       # 常量配置
└── 参考图/              # UI/功能参考设计图
```

## 4. 核心功能说明
- **布局**: 经典的 ERP 管理后台布局（侧边栏 + 顶栏 + 主视图）。
- **流程**: 系统自动重定向至扫码登记页面，说明这是核心业务入口。
- **集成**: 已完成 Supabase 初始化，支持数据库交互。

## 5. 后续建议
- 检查 `.env.local` 确保 Supabase 访问凭据有效。
- 完善 `src/components/ui` 下的基础组件库以提升开发效率。
