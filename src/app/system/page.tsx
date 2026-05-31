'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Users, 
  Bell, 
  Database,
  Globe,
  Monitor,
  ShieldCheck
} from 'lucide-react';

export default function SystemSettingsPage() {
  const router = useRouter();

  const sections = [
    { icon: Users, label: '账号管理', desc: '创建系统登录账号与权限分配', href: '/system/users' },
    { icon: ShieldCheck, label: '安全设置', desc: '修改密码、两步验证与登录日志', href: '/system/password' },
    { icon: Bell, label: '通知中心', desc: '配置邮件、短信与站内信通知', href: null },
    { icon: Database, label: '数据备份', desc: '系统数据导出与备份计划', href: null },
    { icon: Globe, label: '通用设置', desc: '语言、时区与系统显示配置', href: null },
    { icon: Monitor, label: '操作日志', desc: '查看所有管理员的操作记录', href: '/system/logs' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">系统管理</h1>
          <p className="text-sm text-gray-500">配置您的 ERP 系统参数与偏好设置</p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((item) => (
          <div 
            key={item.label}
            onClick={() => item.href && router.push(item.href)}
            onKeyDown={(e) => { if (item.href && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); router.push(item.href); } }}
            tabIndex={item.href ? 0 : -1}
            role={item.href ? 'button' : undefined}
            aria-label={item.href ? `进入${item.label}` : `${item.label} - 即将上线`}
            className={`p-5 card rounded-xl transition-all group outline-none focus-visible:ring-2 focus-visible:ring-blue-400
              ${item.href
                ? 'hover:shadow-md hover:border-blue-300 cursor-pointer'
                : 'opacity-60 cursor-not-allowed'
              }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 bg-gray-50 rounded-lg transition-colors ${item.href ? 'group-hover:bg-blue-50' : ''}`}>
                <item.icon className={`w-6 h-6 text-gray-600 transition-colors ${item.href ? 'group-hover:text-blue-600' : ''}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 mb-1">{item.label}</h3>
                  {!item.href && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded font-medium mb-1">即将上线</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Section Example */}
      <div className="card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">系统状态</h2>
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
            运行中
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">API 版本</p>
              <p className="text-sm font-mono font-bold text-gray-700">v2.4.12-stable</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">数据库连接</p>
              <p className="text-sm font-mono font-bold text-gray-700">Supabase Cloud (AWS-Tokyo)</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">最后备份时间</p>
              <p className="text-sm font-mono font-bold text-gray-700">2026-05-13 04:00:00</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">存储空间使用</p>
              <p className="text-sm font-mono font-bold text-gray-700">12.5 GB / 50 GB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
